import asyncio
from calendar import month_abbr, monthrange
from datetime import date, datetime, timedelta, timezone
from typing import Any

from database import db
from schemas.subscription_admin import (
    EntitlementActionResponse,
    GrantEntitlementRequest,
    RevokeEntitlementRequest,
    SubscriptionAnalyticsResponse,
)
from services.revenuecat_v2_service import (
    RevenueCatV2Error,
    as_http_exception,
    get_revenue,
    grant_entitlement,
    list_all_customer_subscriptions,
    list_customers,
    list_entitlements,
    list_products,
    revenuecat_v2_configured,
    revoke_granted_entitlement,
)

REVENUE_EVENT_TYPES = {
    "INITIAL_PURCHASE",
    "RENEWAL",
    "NON_RENEWING_PURCHASE",
}
REFUND_EVENT_TYPES = {"REFUND"}
REFUND_REVERSED_EVENT_TYPES = {"REFUND_REVERSED"}
RENEWING_STATUSES = {"will_renew", "has_already_renewed"}
ACTIVITY_TITLES = {
    "INITIAL_PURCHASE": "Subscription started",
    "RENEWAL": "Subscription renewed",
    "CANCELLATION": "Renewal cancelled",
    "UNCANCELLATION": "Renewal restored",
    "EXPIRATION": "Subscription expired",
    "BILLING_ISSUE": "Billing issue",
    "PRODUCT_CHANGE": "Plan changed",
    "NON_RENEWING_PURCHASE": "Lifetime access granted",
    "REFUND": "Payment refunded",
    "REFUND_REVERSED": "Refund reversed",
    "TRANSFER": "Subscription transferred",
}

_analytics_cache: tuple[datetime, SubscriptionAnalyticsResponse] | None = None
_revenue_cache: tuple[datetime, list[dict[str, Any]]] | None = None
_analytics_lock = asyncio.Lock()
CACHE_TTL = timedelta(minutes=5)
REVENUE_CACHE_TTL = timedelta(minutes=10)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _from_millis(value: Any) -> datetime | None:
    if not isinstance(value, (int, float)) or value <= 0:
        return None
    return datetime.fromtimestamp(value / 1000, tz=timezone.utc)


def _nested_items(value: Any) -> list[dict[str, Any]]:
    if isinstance(value, dict) and isinstance(value.get("items"), list):
        return [item for item in value["items"] if isinstance(item, dict)]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    return []


def _event(document: dict[str, Any]) -> dict[str, Any]:
    payload = document.get("payload")
    if not isinstance(payload, dict):
        return {}
    event = payload.get("event")
    return event if isinstance(event, dict) else {}


def _event_datetime(event: dict[str, Any]) -> datetime | None:
    return _from_millis(
        event.get("event_timestamp_ms") or event.get("purchased_at_ms")
    )


def _event_revenue_usd(event: dict[str, Any]) -> float:
    try:
        amount = float(event.get("price") or 0)
    except (TypeError, ValueError):
        return 0.0

    event_type = str(event.get("type") or "")
    if event_type in REFUND_EVENT_TYPES:
        return -abs(amount)
    if event_type in REFUND_REVERSED_EVENT_TYPES:
        return abs(amount)
    if event_type in REVENUE_EVENT_TYPES:
        return amount
    return 0.0


def _month_start(value: datetime) -> datetime:
    return value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _shift_month(value: datetime, offset: int) -> datetime:
    month_index = value.year * 12 + value.month - 1 + offset
    year, zero_based_month = divmod(month_index, 12)
    return value.replace(year=year, month=zero_based_month + 1, day=1)


def _humanize(value: str | None, fallback: str) -> str:
    if not value:
        return fallback
    normalized = value.split(":")[-1].replace("-", " ").replace("_", " ")
    return " ".join(word.capitalize() for word in normalized.split())


def _duration_interval(duration: str | None, product_id: str | None) -> str:
    normalized = (duration or "").upper()
    if "Y" in normalized:
        return "yearly"
    if "M" in normalized:
        return "monthly"
    if "W" in normalized:
        return "weekly"
    if "D" in normalized:
        return "daily"
    if "lifetime" in (product_id or "").lower():
        return "lifetime"
    return "unknown"


def _product_price(product: dict[str, Any]) -> tuple[float | None, str | None, str | None]:
    indicative = product.get("indicative_price")
    if not isinstance(indicative, dict):
        return None, None, None
    raw_amount = indicative.get("amount_micros")
    try:
        amount = float(raw_amount) / 1_000_000
    except (TypeError, ValueError):
        amount = None
    return amount, indicative.get("currency"), indicative.get("country")


def _attributes(customer: dict[str, Any]) -> dict[str, str]:
    result: dict[str, str] = {}
    for attribute in _nested_items(customer.get("attributes")):
        name = attribute.get("name")
        value = attribute.get("value")
        if isinstance(name, str) and value is not None:
            result[name] = str(value)
    return result


def _subscription_revenue(subscription: dict[str, Any]) -> float:
    revenue = subscription.get("total_revenue_in_usd")
    if not isinstance(revenue, dict):
        return 0
    try:
        return float(revenue.get("gross") or 0)
    except (TypeError, ValueError):
        return 0


def _subscription_sort_key(subscription: dict[str, Any]) -> tuple[int, int]:
    environment = str(subscription.get("environment") or "").lower()
    gives_access = bool(subscription.get("gives_access"))
    return (environment == "production", gives_access)


def _will_renew(auto_renewal_status: str | None) -> bool | None:
    if not auto_renewal_status:
        return None
    return auto_renewal_status in RENEWING_STATUSES


def _row_status(subscription: dict[str, Any] | None) -> str:
    if not subscription:
        return "Inactive"
    status_value = str(subscription.get("status") or "unknown")
    status_names = {
        "trialing": "Trialing",
        "active": "Active",
        "expired": "Expired",
        "in_grace_period": "Grace Period",
        "in_billing_retry": "Billing Retry",
        "paused": "Paused",
        "incomplete": "Incomplete",
        "unknown": "Unknown",
    }
    if (
        subscription.get("gives_access")
        and subscription.get("auto_renewal_status") == "will_not_renew"
    ):
        return "Cancelled"
    return status_names.get(status_value, _humanize(status_value, "Unknown"))


def _issue(error: RevenueCatV2Error) -> dict[str, str]:
    permission_hint = (
        " Check the V2 key permissions in RevenueCat."
        if error.status_code in {401, 403}
        else ""
    )
    return {
        "code": error.capability,
        "title": _humanize(error.capability, "RevenueCat data unavailable"),
        "message": f"{error.message}.{permission_hint}".replace("..", "."),
    }


async def _revenue_growth(
    now: datetime,
) -> tuple[list[dict[str, Any]], RevenueCatV2Error | None]:
    global _revenue_cache
    if (
        _revenue_cache
        and now - _revenue_cache[0] < REVENUE_CACHE_TTL
    ):
        return _revenue_cache[1], None

    periods = [_shift_month(_month_start(now), offset) for offset in range(-11, 1)]

    async def fetch(period: datetime) -> tuple[datetime, float]:
        last_day = monthrange(period.year, period.month)[1]
        end = min(date(period.year, period.month, last_day), now.date())
        amount = await get_revenue(period.date(), end)
        return period, amount

    try:
        results = await asyncio.gather(*(fetch(period) for period in periods))
        values = [
            {
                "label": f"{month_abbr[period.month].upper()} {str(period.year)[2:]}",
                "period_start": period,
                "revenue_usd": round(amount, 2),
            }
            for period, amount in results
        ]
        _revenue_cache = (now, values)
        return values, None
    except RevenueCatV2Error as error:
        return [], error


async def _event_fallback_revenue(
    now: datetime,
    event_documents: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    chart_start = _shift_month(_month_start(now), -11)
    buckets = {
        _shift_month(chart_start, offset): 0.0
        for offset in range(12)
    }
    for document in event_documents:
        event = _event(document)
        if str(event.get("environment") or "").upper() != "PRODUCTION":
            continue
        occurred_at = _from_millis(
            event.get("purchased_at_ms") or event.get("event_timestamp_ms")
        )
        if not occurred_at:
            continue
        bucket = _month_start(occurred_at)
        if bucket in buckets:
            buckets[bucket] += _event_revenue_usd(event)
    return [
        {
            "label": f"{month_abbr[period.month].upper()} {str(period.year)[2:]}",
            "period_start": period,
            "revenue_usd": round(amount, 2),
        }
        for period, amount in buckets.items()
    ]


async def _build_subscription_analytics() -> SubscriptionAnalyticsResponse:
    now = _now()
    missing_data: list[dict[str, str]] = []

    event_documents = await db.revenuecat_events.find(
        {},
        {
            "event_id": 1,
            "event_type": 1,
            "payload": 1,
            "processed_user_id": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).to_list(length=1000)
    production_event_count = sum(
        str(_event(document).get("environment") or "").upper() == "PRODUCTION"
        for document in event_documents
    )
    sandbox_event_count = sum(
        str(_event(document).get("environment") or "").upper() == "SANDBOX"
        for document in event_documents
    )
    latest_event_at = next(
        (
            occurred_at
            for document in event_documents
            if (occurred_at := _event_datetime(_event(document)))
        ),
        None,
    )

    if not revenuecat_v2_configured():
        missing_data.append(
            {
                "code": "v2_configuration",
                "title": "RevenueCat V2 is not configured",
                "message": (
                    "Set REVENUECAT_V2_API_KEY and REVENUECAT_PROJECT_ID. "
                    "The V1 key remains separate."
                ),
            }
        )
        customers: list[dict[str, Any]] = []
        subscriptions_by_customer: dict[str, list[dict[str, Any]]] = {}
        products: list[dict[str, Any]] = []
        entitlements: list[dict[str, Any]] = []
    else:
        try:
            customers = await list_customers()
        except RevenueCatV2Error as error:
            customers = []
            missing_data.append(_issue(error))

        if customers:
            try:
                subscriptions_by_customer = await list_all_customer_subscriptions(
                    customers
                )
            except RevenueCatV2Error as error:
                subscriptions_by_customer = {}
                missing_data.append(_issue(error))
        else:
            subscriptions_by_customer = {}

        try:
            products = await list_products()
        except RevenueCatV2Error as error:
            products = []
            missing_data.append(_issue(error))

        try:
            entitlements = await list_entitlements()
        except RevenueCatV2Error as error:
            entitlements = []
            missing_data.append(_issue(error))

    backend_users = await db.users.find(
        {},
        {
            "full_name": 1,
            "email": 1,
            "subscription.revenuecat_app_user_id": 1,
        },
    ).to_list(length=None)
    backend_by_revenuecat_id: dict[str, dict[str, Any]] = {}
    for user in backend_users:
        backend_by_revenuecat_id[str(user["_id"])] = user
        revenuecat_id = (user.get("subscription") or {}).get(
            "revenuecat_app_user_id"
        )
        if revenuecat_id:
            backend_by_revenuecat_id[str(revenuecat_id)] = user

    product_by_id = {
        str(product.get("id")): product
        for product in products
        if product.get("id")
    }
    entitlement_by_id = {
        str(entitlement.get("id")): entitlement
        for entitlement in entitlements
        if entitlement.get("id")
    }

    rows: list[dict[str, Any]] = []
    production_active_subscriptions: list[dict[str, Any]] = []
    subscriber_counts: dict[str, set[str]] = {}

    for customer in customers:
        customer_id = str(customer.get("id") or "")
        customer_subscriptions = subscriptions_by_customer.get(customer_id, [])
        production_subscriptions = [
            subscription
            for subscription in customer_subscriptions
            if str(subscription.get("environment") or "").lower() == "production"
        ]
        production_subscriptions.sort(key=_subscription_sort_key, reverse=True)
        selected = production_subscriptions[0] if production_subscriptions else None

        for subscription in production_subscriptions:
            if subscription.get("gives_access"):
                production_active_subscriptions.append(subscription)
                product_id = subscription.get("product_id")
                if product_id:
                    subscriber_counts.setdefault(str(product_id), set()).add(
                        customer_id
                    )

        customer_attributes = _attributes(customer)
        backend_user = backend_by_revenuecat_id.get(customer_id)
        name = (
            (backend_user or {}).get("full_name")
            or customer_attributes.get("$displayName")
            or customer_attributes.get("display_name")
            or customer_id
        )
        email = (
            (backend_user or {}).get("email")
            or customer_attributes.get("$email")
            or customer_attributes.get("email")
            or "Not provided"
        )

        promotional_entitlement_ids: set[str] = set()
        for subscription in production_subscriptions:
            if str(subscription.get("store") or "").lower() != "promotional":
                continue
            for entitlement in _nested_items(subscription.get("entitlements")):
                entitlement_id = entitlement.get("id")
                if entitlement_id:
                    promotional_entitlement_ids.add(str(entitlement_id))

        active_entitlements = []
        for active_entitlement in _nested_items(
            customer.get("active_entitlements")
        ):
            entitlement_id = str(
                active_entitlement.get("entitlement_id")
                or active_entitlement.get("id")
                or ""
            )
            if not entitlement_id:
                continue
            definition = entitlement_by_id.get(entitlement_id, {})
            active_entitlements.append(
                {
                    "id": entitlement_id,
                    "lookup_key": definition.get("lookup_key")
                    or entitlement_id,
                    "display_name": definition.get("display_name")
                    or _humanize(
                        definition.get("lookup_key"),
                        "Entitlement",
                    ),
                    "expires_at": _from_millis(
                        active_entitlement.get("expires_at")
                    ),
                    "promotional": entitlement_id
                    in promotional_entitlement_ids,
                }
            )

        product_id = str(selected.get("product_id")) if selected and selected.get("product_id") else None
        product = product_by_id.get(product_id or "", {})
        auto_renewal_status = (
            str(selected.get("auto_renewal_status"))
            if selected and selected.get("auto_renewal_status")
            else None
        )
        rows.append(
            {
                "id": customer_id,
                "customer_id": customer_id,
                "name": name,
                "email": email,
                "product_id": product_id,
                "plan_name": product.get("display_name")
                or _humanize(
                    product.get("store_identifier") or product_id,
                    "No active plan",
                ),
                "subscription_id": selected.get("id") if selected else None,
                "expires_at": _from_millis(
                    (selected or {}).get("current_period_ends_at")
                    or (selected or {}).get("ends_at")
                ),
                "store": (selected or {}).get("store"),
                "environment": (
                    str((selected or {}).get("environment")).upper()
                    if (selected or {}).get("environment")
                    else None
                ),
                "status": _row_status(selected),
                "auto_renewal_status": auto_renewal_status,
                "will_renew": _will_renew(auto_renewal_status),
                "gives_access": bool((selected or {}).get("gives_access")),
                "pending_payment": bool(
                    (selected or {}).get("pending_payment")
                ),
                "total_revenue_usd": round(
                    sum(
                        _subscription_revenue(subscription)
                        for subscription in production_subscriptions
                    ),
                    2,
                ),
                "first_seen_at": _from_millis(customer.get("first_seen_at")),
                "last_seen_at": _from_millis(customer.get("last_seen_at")),
                "country": customer.get("last_seen_country"),
                "platform": customer.get("last_seen_platform"),
                "entitlements": active_entitlements,
            }
        )

    rows.sort(
        key=lambda item: (
            not item["gives_access"],
            item["name"].lower(),
        )
    )

    plan_summaries = []
    for product in products:
        product_id = str(product.get("id") or "")
        if not product_id:
            continue
        duration = (
            product.get("subscription", {}).get("duration")
            if isinstance(product.get("subscription"), dict)
            else None
        )
        price, currency, country = _product_price(product)
        plan_summaries.append(
            {
                "product_id": product_id,
                "store_identifier": product.get("store_identifier"),
                "name": product.get("display_name")
                or _humanize(
                    product.get("store_identifier"),
                    "RevenueCat product",
                ),
                "duration": duration,
                "interval": _duration_interval(
                    duration,
                    product.get("store_identifier"),
                ),
                "subscribers": len(subscriber_counts.get(product_id, set())),
                "price": price,
                "price_currency": currency,
                "price_country": country,
                "state": product.get("state"),
            }
        )
    plan_summaries.sort(
        key=lambda item: (
            item["state"] != "active",
            -item["subscribers"],
            item["name"],
        )
    )

    active_customer_ids = {
        str(subscription.get("customer_id"))
        for subscription in production_active_subscriptions
        if subscription.get("customer_id")
    }
    recurring = [
        subscription
        for subscription in production_active_subscriptions
        if str(subscription.get("store") or "").lower() != "promotional"
        and subscription.get("auto_renewal_status")
    ]
    yearly_customers = {
        str(subscription.get("customer_id"))
        for subscription in production_active_subscriptions
        if _duration_interval(
            (
                product_by_id.get(str(subscription.get("product_id")), {})
                .get("subscription", {})
                .get("duration")
                if isinstance(
                    product_by_id.get(
                        str(subscription.get("product_id")),
                        {},
                    ).get("subscription"),
                    dict,
                )
                else None
            ),
            str(subscription.get("product_id") or ""),
        )
        == "yearly"
    }
    yearly_percent = (
        round((len(yearly_customers) / len(active_customer_ids)) * 100, 1)
        if active_customer_ids
        else None
    )
    renewal_rate = (
        round(
            (
                sum(
                    subscription.get("auto_renewal_status")
                    in RENEWING_STATUSES
                    for subscription in recurring
                )
                / len(recurring)
            )
            * 100,
            1,
        )
        if recurring
        else None
    )

    revenue_growth, revenue_error = (
        await _revenue_growth(now)
        if revenuecat_v2_configured()
        else ([], None)
    )
    if revenue_error:
        missing_data.append(_issue(revenue_error))
    if not revenue_growth:
        revenue_growth = await _event_fallback_revenue(now, event_documents)
    current_month_revenue = (
        revenue_growth[-1]["revenue_usd"] if revenue_growth else None
    )

    user_by_id = {str(user["_id"]): user for user in backend_users}
    recent_activity = []
    for document in event_documents:
        event = _event(document)
        occurred_at = _event_datetime(event)
        if not occurred_at:
            continue
        event_type = str(event.get("type") or "UNKNOWN")
        user = user_by_id.get(str(document.get("processed_user_id")))
        attributes = event.get("subscriber_attributes")
        display_name = None
        if isinstance(attributes, dict):
            attribute = attributes.get("$displayName")
            display_name = (
                attribute.get("value")
                if isinstance(attribute, dict)
                else attribute
            )
        name = (
            (user or {}).get("full_name")
            or display_name
            or "RevenueCat customer"
        )
        amount = _event_revenue_usd(event)
        recent_activity.append(
            {
                "id": str(document.get("event_id") or document["_id"]),
                "title": ACTIVITY_TITLES.get(
                    event_type,
                    _humanize(event_type, "RevenueCat event"),
                ),
                "description": (
                    f"{name} · "
                    f"{_humanize(event.get('product_id'), 'No product')}"
                ),
                "event_type": event_type,
                "occurred_at": occurred_at,
                "environment": event.get("environment"),
                "amount_usd": round(amount, 2) if amount else None,
            }
        )
        if len(recent_activity) == 5:
            break

    if sandbox_event_count:
        missing_data.append(
            {
                "code": "sandbox_excluded",
                "title": "Sandbox data excluded",
                "message": (
                    f"{sandbox_event_count} sandbox event"
                    f"{'s were' if sandbox_event_count != 1 else ' was'} "
                    "excluded from production metrics."
                ),
            }
        )
    if current_month_revenue == 0:
        missing_data.append(
            {
                "code": "no_paid_production_transactions",
                "title": "No paid production revenue this month",
                "message": (
                    "RevenueCat returned $0 production revenue for the "
                    "current calendar month."
                ),
            }
        )

    entitlement_options = [
        {
            "id": str(entitlement.get("id")),
            "lookup_key": entitlement.get("lookup_key")
            or str(entitlement.get("id")),
            "display_name": entitlement.get("display_name")
            or _humanize(
                entitlement.get("lookup_key"),
                "Entitlement",
            ),
        }
        for entitlement in entitlements
        if entitlement.get("id") and entitlement.get("state") != "archived"
    ]

    return SubscriptionAnalyticsResponse(
        source={
            "customer_status": (
                "live RevenueCat V2"
                if revenuecat_v2_configured() and customers
                else "RevenueCat webhook fallback"
            ),
            "event_history": "RevenueCat webhooks stored in MongoDB",
            "production_event_count": production_event_count,
            "sandbox_event_count": sandbox_event_count,
            "last_event_at": latest_event_at,
            "generated_at": now,
        },
        metrics={
            "active_subscribers": {
                "value": len(active_customer_ids),
                "available": bool(customers) or revenuecat_v2_configured(),
            },
            "monthly_revenue_usd": {
                "value": current_month_revenue,
                "available": current_month_revenue is not None,
            },
            "yearly_members_percent": {
                "value": yearly_percent,
                "available": yearly_percent is not None,
            },
            "renewal_rate_percent": {
                "value": renewal_rate,
                "available": renewal_rate is not None,
            },
        },
        plans=plan_summaries,
        entitlements=entitlement_options,
        revenue_growth=revenue_growth,
        subscriptions=rows,
        recent_activity=recent_activity,
        missing_data=missing_data,
    )


async def get_subscription_analytics(
    force_refresh: bool = False,
) -> SubscriptionAnalyticsResponse:
    global _analytics_cache
    now = _now()
    if (
        not force_refresh
        and _analytics_cache
        and now - _analytics_cache[0] < CACHE_TTL
    ):
        return _analytics_cache[1]

    async with _analytics_lock:
        now = _now()
        if (
            not force_refresh
            and _analytics_cache
            and now - _analytics_cache[0] < CACHE_TTL
        ):
            return _analytics_cache[1]
        analytics = await _build_subscription_analytics()
        _analytics_cache = (now, analytics)
        return analytics


async def grant_customer_entitlement(
    payload: GrantEntitlementRequest,
    admin_id: str,
) -> EntitlementActionResponse:
    expires_at = payload.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    else:
        expires_at = expires_at.astimezone(timezone.utc)
    if expires_at <= _now():
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Entitlement expiration must be in the future",
        )
    try:
        await grant_entitlement(
            payload.customer_id,
            payload.entitlement_id,
            expires_at,
        )
    except RevenueCatV2Error as error:
        raise as_http_exception(error) from error

    await db.admin_subscription_actions.insert_one(
        {
            "action": "grant_entitlement",
            "admin_id": admin_id,
            "customer_id": payload.customer_id,
            "entitlement_id": payload.entitlement_id,
            "expires_at": expires_at,
            "created_at": _now(),
        }
    )
    await get_subscription_analytics(force_refresh=True)
    return EntitlementActionResponse(message="Entitlement granted")


async def revoke_customer_entitlement(
    payload: RevokeEntitlementRequest,
    admin_id: str,
) -> EntitlementActionResponse:
    try:
        await revoke_granted_entitlement(
            payload.customer_id,
            payload.entitlement_id,
        )
    except RevenueCatV2Error as error:
        raise as_http_exception(error) from error

    await db.admin_subscription_actions.insert_one(
        {
            "action": "revoke_entitlement",
            "admin_id": admin_id,
            "customer_id": payload.customer_id,
            "entitlement_id": payload.entitlement_id,
            "created_at": _now(),
        }
    )
    await get_subscription_analytics(force_refresh=True)
    return EntitlementActionResponse(message="Entitlement revoked")
