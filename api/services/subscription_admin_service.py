import asyncio
from calendar import month_abbr
from datetime import datetime, timedelta, timezone
from typing import Any

from database import db
from schemas.subscription_admin import SubscriptionAnalyticsResponse
from services.subscription_service import (
    refresh_user_subscription_from_revenuecat,
    serialize_subscription,
)

REVENUE_EVENT_TYPES = {
    "INITIAL_PURCHASE",
    "RENEWAL",
    "NON_RENEWING_PURCHASE",
}
REFUND_EVENT_TYPES = {"REFUND"}
REFUND_REVERSED_EVENT_TYPES = {"REFUND_REVERSED"}
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


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _event(document: dict[str, Any]) -> dict[str, Any]:
    payload = document.get("payload")
    if not isinstance(payload, dict):
        return {}
    event = payload.get("event")
    return event if isinstance(event, dict) else {}


def _event_datetime(event: dict[str, Any]) -> datetime | None:
    value = event.get("event_timestamp_ms") or event.get("purchased_at_ms")
    if not isinstance(value, (int, float)) or value <= 0:
        return None
    return datetime.fromtimestamp(value / 1000, tz=timezone.utc)


def _revenue_datetime(event: dict[str, Any]) -> datetime | None:
    value = event.get("purchased_at_ms") or event.get("event_timestamp_ms")
    if not isinstance(value, (int, float)) or value <= 0:
        return None
    return datetime.fromtimestamp(value / 1000, tz=timezone.utc)


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


def _humanize_product(product_id: str | None) -> str:
    if not product_id:
        return "No active plan"
    value = product_id.split(":")[-1].replace("-", " ").replace("_", " ")
    return " ".join(word.capitalize() for word in value.split())


def _billing_interval(product_id: str | None, event_type: str | None = None) -> str:
    value = (product_id or "").lower()
    if "lifetime" in value or event_type == "NON_RENEWING_PURCHASE":
        return "lifetime"
    if any(part in value for part in ("annual", "yearly", "year")):
        return "yearly"
    if any(part in value for part in ("monthly", "month")):
        return "monthly"
    if any(part in value for part in ("weekly", "week")):
        return "weekly"
    return "unknown"


def _attribute_value(event: dict[str, Any], key: str) -> str | None:
    attributes = event.get("subscriber_attributes")
    if not isinstance(attributes, dict):
        return None
    attribute = attributes.get(key)
    if isinstance(attribute, dict):
        value = attribute.get("value")
        return str(value) if value else None
    return str(attribute) if attribute else None


def _subscription_status(subscription: dict[str, Any], now: datetime) -> str:
    expires_at = _as_utc(subscription.get("expires_at"))
    if subscription.get("active"):
        if expires_at and expires_at <= now + timedelta(days=30):
            return "Expiring"
        if subscription.get("will_renew") is False:
            return "Cancelled"
        return "Active"
    if expires_at and expires_at <= now:
        return "Expired"
    return "Inactive"


async def _refresh_revenuecat_customers(
    users: list[dict[str, Any]],
) -> tuple[int, int]:
    candidates = [
        user
        for user in users
        if (user.get("subscription") or {}).get("revenuecat_app_user_id")
    ]
    if not candidates:
        return 0, 0

    semaphore = asyncio.Semaphore(8)

    async def refresh(user: dict[str, Any]) -> bool:
        async with semaphore:
            try:
                await refresh_user_subscription_from_revenuecat(user)
                return True
            except Exception:
                return False

    results = await asyncio.gather(*(refresh(user) for user in candidates))
    return sum(results), len(results) - sum(results)


async def get_subscription_analytics() -> SubscriptionAnalyticsResponse:
    now = _now()
    users = await db.users.find(
        {"subscription": {"$exists": True}},
        {
            "full_name": 1,
            "email": 1,
            "subscription": 1,
        },
    ).to_list(length=None)

    refreshed, refresh_failures = await _refresh_revenuecat_customers(users)
    if refreshed:
        users = await db.users.find(
            {"subscription": {"$exists": True}},
            {
                "full_name": 1,
                "email": 1,
                "subscription": 1,
            },
        ).to_list(length=None)

    chart_start = _shift_month(_month_start(now), -11)
    event_documents = await db.revenuecat_events.find(
        {
            "$or": [
                {"payload.event.event_timestamp_ms": {"$gte": int(chart_start.timestamp() * 1000)}},
                {"payload.event.purchased_at_ms": {"$gte": int(chart_start.timestamp() * 1000)}},
            ]
        },
        {
            "event_id": 1,
            "event_type": 1,
            "payload": 1,
            "processed_user_id": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).to_list(length=None)

    production_events = [
        document
        for document in event_documents
        if str(_event(document).get("environment") or "").upper() == "PRODUCTION"
    ]
    sandbox_event_count = await db.revenuecat_events.count_documents(
        {"payload.event.environment": "SANDBOX"}
    )
    production_event_count = await db.revenuecat_events.count_documents(
        {"payload.event.environment": "PRODUCTION"}
    )

    latest_event_at = None
    for document in event_documents:
        occurred_at = _event_datetime(_event(document))
        if occurred_at and (latest_event_at is None or occurred_at > latest_event_at):
            latest_event_at = occurred_at

    user_by_id = {str(user["_id"]): user for user in users}
    rows = []
    active_production = []
    for user in users:
        subscription = serialize_subscription(user)
        environment = str(subscription.get("environment") or "").upper() or None
        if subscription.get("active") and environment == "PRODUCTION":
            active_production.append((user, subscription))
        rows.append(
            {
                "id": str(user["_id"]),
                "name": user.get("full_name") or user["email"].split("@")[0],
                "email": user["email"],
                "product_id": subscription.get("product_id"),
                "plan_name": _humanize_product(subscription.get("product_id")),
                "expires_at": subscription.get("expires_at"),
                "store": subscription.get("store"),
                "environment": environment,
                "status": _subscription_status(subscription, now),
                "will_renew": subscription.get("will_renew"),
            }
        )
    rows.sort(
        key=lambda item: (
            item["status"] != "Active",
            item["name"].lower(),
        )
    )

    recurring_active = [
        subscription
        for _, subscription in active_production
        if _billing_interval(
            subscription.get("product_id"),
            subscription.get("last_event_type"),
        )
        not in {"lifetime", "unknown"}
        and subscription.get("will_renew") is not None
    ]
    yearly_members = [
        subscription
        for _, subscription in active_production
        if _billing_interval(subscription.get("product_id")) == "yearly"
    ]

    month_buckets = {
        _shift_month(chart_start, offset): 0.0
        for offset in range(12)
    }
    for document in production_events:
        event = _event(document)
        occurred_at = _revenue_datetime(event)
        if not occurred_at:
            continue
        bucket = _month_start(occurred_at)
        if bucket in month_buckets:
            month_buckets[bucket] += _event_revenue_usd(event)

    revenue_growth = [
        {
            "label": f"{month_abbr[period.month].upper()} {str(period.year)[2:]}",
            "period_start": period,
            "revenue_usd": round(amount, 2),
        }
        for period, amount in month_buckets.items()
    ]
    current_month_revenue = round(month_buckets.get(_month_start(now), 0.0), 2)

    latest_product_events: dict[str, dict[str, Any]] = {}
    for document in production_events:
        event = _event(document)
        product_id = event.get("product_id")
        if product_id and product_id not in latest_product_events:
            latest_product_events[product_id] = event

    plan_counts: dict[str, int] = {}
    for _, subscription in active_production:
        product_id = subscription.get("product_id")
        if product_id:
            plan_counts[product_id] = plan_counts.get(product_id, 0) + 1

    plans = []
    for product_id, subscriber_count in plan_counts.items():
        observed_event = latest_product_events.get(product_id, {})
        observed_price = observed_event.get("price")
        try:
            observed_price = float(observed_price) if observed_price is not None else None
        except (TypeError, ValueError):
            observed_price = None
        plans.append(
            {
                "product_id": product_id,
                "name": _humanize_product(product_id),
                "interval": _billing_interval(
                    product_id,
                    observed_event.get("type"),
                ),
                "subscribers": subscriber_count,
                "observed_price_usd": observed_price,
                "conversion_percent": None,
                "environment": "PRODUCTION",
            }
        )
    plans.sort(key=lambda item: (-item["subscribers"], item["name"]))

    recent_activity = []
    for document in event_documents[:8]:
        event = _event(document)
        occurred_at = _event_datetime(event)
        if not occurred_at:
            continue
        event_type = str(event.get("type") or "UNKNOWN")
        user = user_by_id.get(str(document.get("processed_user_id")))
        name = (
            (user or {}).get("full_name")
            or _attribute_value(event, "$displayName")
            or "RevenueCat customer"
        )
        product_name = _humanize_product(event.get("product_id"))
        amount = _event_revenue_usd(event)
        recent_activity.append(
            {
                "id": str(document.get("event_id") or document["_id"]),
                "title": ACTIVITY_TITLES.get(
                    event_type,
                    event_type.replace("_", " ").title(),
                ),
                "description": f"{name} · {product_name}",
                "event_type": event_type,
                "occurred_at": occurred_at,
                "environment": event.get("environment"),
                "amount_usd": round(amount, 2) if amount else None,
            }
        )
        if len(recent_activity) == 5:
            break

    missing_data = [
        {
            "code": "project_customer_list",
            "title": "Project-wide customer list unavailable",
            "message": (
                "The configured RevenueCat key is a legacy v1 key. Add a "
                "REVENUECAT_V2_API_KEY with customer read permission to list "
                "customers that are not linked to Body Axis users."
            ),
        },
        {
            "code": "product_catalog",
            "title": "Product catalog and configured prices unavailable",
            "message": (
                "The current key cannot read the RevenueCat v2 product catalog. "
                "Plan cards use product IDs and prices observed in webhook events."
            ),
        },
        {
            "code": "conversion_rate",
            "title": "Conversion rate unavailable",
            "message": (
                "Conversion metrics are not included in RevenueCat v1 customer "
                "responses or webhook events."
            ),
        },
        {
            "code": "payment_method",
            "title": "Payment method details unavailable",
            "message": (
                "RevenueCat does not provide card numbers or PayPal details in "
                "these responses, so the table displays the purchase store."
            ),
        },
    ]
    if sandbox_event_count:
        missing_data.append(
            {
                "code": "sandbox_excluded",
                "title": "Sandbox revenue excluded",
                "message": (
                    f"{sandbox_event_count} sandbox event"
                    f"{'s were' if sandbox_event_count != 1 else ' was'} excluded "
                    "from production revenue and subscriber metrics."
                ),
            }
        )
    if not any(_event_revenue_usd(_event(document)) for document in production_events):
        missing_data.append(
            {
                "code": "no_paid_production_transactions",
                "title": "No paid production revenue yet",
                "message": (
                    "RevenueCat has no paid production transactions in the last "
                    "12 months. The production revenue chart is therefore $0."
                ),
            }
        )
    if refresh_failures:
        missing_data.append(
            {
                "code": "customer_refresh_failed",
                "title": "Some customer statuses could not be refreshed",
                "message": (
                    f"{refresh_failures} RevenueCat customer request"
                    f"{'s' if refresh_failures != 1 else ''} failed; stored "
                    "webhook status is shown for those users."
                ),
            }
        )

    yearly_percent = (
        round((len(yearly_members) / len(active_production)) * 100, 1)
        if active_production
        else None
    )
    renewal_rate = (
        round(
            (
                sum(subscription.get("will_renew") is True for subscription in recurring_active)
                / len(recurring_active)
            )
            * 100,
            1,
        )
        if recurring_active
        else None
    )

    return SubscriptionAnalyticsResponse(
        source={
            "customer_status": (
                f"live RevenueCat v1 ({refreshed} customer"
                f"{'s' if refreshed != 1 else ''} refreshed)"
                if refreshed
                else "stored RevenueCat webhook status"
            ),
            "event_history": "RevenueCat webhooks stored in MongoDB",
            "production_event_count": production_event_count,
            "sandbox_event_count": sandbox_event_count,
            "last_event_at": latest_event_at,
            "generated_at": now,
        },
        metrics={
            "active_subscribers": {
                "value": len(active_production),
                "available": True,
            },
            "monthly_revenue_usd": {
                "value": current_month_revenue,
                "available": True,
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
        plans=plans,
        revenue_growth=revenue_growth,
        subscriptions=rows,
        recent_activity=recent_activity,
        missing_data=missing_data,
    )
