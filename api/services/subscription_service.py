from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import httpx
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from core.config import settings
from database import db

REVENUECAT_API_BASE = "https://api.revenuecat.com/v1"
INACTIVE_EVENT_TYPES = {"EXPIRATION", "TRANSFER"}
CANCEL_RENEWAL_EVENT_TYPES = {"CANCELLATION", "EXPIRATION", "BILLING_ISSUE"}
PLACEHOLDER_API_KEY_PARTS = ("dummy", "replace", "your_")


async def ensure_subscription_indexes() -> None:
    await db.revenuecat_events.create_index("event_id", unique=True, sparse=True)
    await db.users.create_index("subscription.revenuecat_app_user_id", sparse=True)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def _parse_revenuecat_datetime(value: Any) -> datetime | None:
    if value is None:
        return None

    if isinstance(value, (int, float)):
        if value <= 0:
            return None
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc)

    if isinstance(value, str) and value:
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return _as_utc(parsed)
        except ValueError:
            return None

    return None


def _field(data: dict[str, Any], names: list[str]) -> Any:
    for name in names:
        if name in data:
            return data[name]
    return None


def _default_subscription() -> dict[str, Any]:
    return {
        "active": False,
        "entitlement_id": settings.revenuecat_entitlement_id,
        "product_id": None,
        "store": None,
        "environment": None,
        "expires_at": None,
        "will_renew": None,
        "management_url": None,
        "last_event_type": None,
        "updated_at": None,
    }


def serialize_subscription(user: dict[str, Any]) -> dict[str, Any]:
    subscription = {**_default_subscription(), **user.get("subscription", {})}
    expires_at = _as_utc(subscription.get("expires_at"))
    active = bool(subscription.get("active"))

    if active and expires_at and expires_at <= _now():
        active = False

    return {
        "active": active,
        "entitlement_id": subscription.get(
            "entitlement_id",
            settings.revenuecat_entitlement_id,
        ),
        "product_id": subscription.get("product_id"),
        "store": subscription.get("store"),
        "environment": subscription.get("environment"),
        "expires_at": expires_at,
        "will_renew": subscription.get("will_renew"),
        "management_url": subscription.get("management_url"),
        "last_event_type": subscription.get("last_event_type"),
        "updated_at": subscription.get("updated_at"),
    }


def _get_revenuecat_api_key() -> str | None:
    api_key = settings.revenuecat_rest_api_key
    if not api_key:
        return None

    normalized_key = api_key.strip().lower()
    if any(part in normalized_key for part in PLACEHOLDER_API_KEY_PARTS):
        return None

    return api_key


def _candidate_revenuecat_user_ids(event: dict[str, Any]) -> list[str]:
    candidates: list[str] = []

    for value in (
        event.get("app_user_id"),
        event.get("original_app_user_id"),
    ):
        if isinstance(value, str) and value and value not in candidates:
            candidates.append(value)

    aliases = event.get("aliases")
    if isinstance(aliases, list):
        for alias in aliases:
            if isinstance(alias, str) and alias and alias not in candidates:
                candidates.append(alias)

    return candidates


async def _find_user_for_revenuecat_event(
    event: dict[str, Any],
) -> dict[str, Any] | None:
    candidate_ids = _candidate_revenuecat_user_ids(event)
    if not candidate_ids:
        return None

    queries: list[dict[str, Any]] = [
        {"subscription.revenuecat_app_user_id": {"$in": candidate_ids}},
    ]

    object_ids = []
    for candidate_id in candidate_ids:
        try:
            object_ids.append(ObjectId(candidate_id))
        except InvalidId:
            pass

    if object_ids:
        queries.append({"_id": {"$in": object_ids}})

    return await db.users.find_one({"$or": queries})


def _subscription_from_event(event: dict[str, Any]) -> dict[str, Any]:
    event_type = str(event.get("type") or "")
    entitlement_ids = event.get("entitlement_ids") or []
    expires_at = _parse_revenuecat_datetime(event.get("expiration_at_ms"))
    has_entitlement = settings.revenuecat_entitlement_id in entitlement_ids
    active = (
        has_entitlement
        and event_type not in INACTIVE_EVENT_TYPES
        and (expires_at is None or expires_at > _now())
    )

    will_renew: bool | None = None
    if active:
        will_renew = event_type not in CANCEL_RENEWAL_EVENT_TYPES

    return {
        "active": active,
        "entitlement_id": settings.revenuecat_entitlement_id,
        "product_id": event.get("product_id"),
        "store": event.get("store"),
        "environment": event.get("environment"),
        "expires_at": expires_at,
        "will_renew": will_renew,
        "management_url": None,
        "last_event_type": event_type or None,
        "updated_at": _now(),
        "revenuecat_app_user_id": event.get("app_user_id"),
        "last_transaction_id": event.get("transaction_id"),
        "original_transaction_id": event.get("original_transaction_id"),
    }


async def _record_revenuecat_event(
    event: dict[str, Any],
    payload: dict[str, Any],
    user: dict[str, Any] | None,
) -> None:
    event_id = event.get("id")
    if not event_id:
        return

    try:
        await db.revenuecat_events.insert_one(
            {
                "event_id": event_id,
                "event_type": event.get("type"),
                "app_user_id": event.get("app_user_id"),
                "payload": payload,
                "processed_user_id": user["_id"] if user else None,
                "created_at": _now(),
            }
        )
        
        event_type = event.get("type", "UNKNOWN")
        user_identifier = user.get("email") if user else event.get("app_user_id", "Unknown User")
        friendly_type = event_type.replace("_", " ").title()
        message = f"Subscription update: {friendly_type} for {user_identifier}."
        
        if event_type == "INITIAL_PURCHASE":
            message = f"New Subscription Purchase! User {user_identifier} purchased a plan."
        elif event_type == "RENEWAL":
            message = f"Subscription Renewed: User {user_identifier} renewed successfully."
        elif event_type == "CANCELLATION":
            message = f"Subscription Cancelled: User {user_identifier} cancelled auto-renewal."
        elif event_type == "EXPIRATION":
            message = f"Subscription Expired: User {user_identifier}'s plan expired."
            
        from services.notification_service import create_notification
        await create_notification(
            message=message,
            notification_type="subscription"
        )
    except DuplicateKeyError:
        return


async def process_revenuecat_webhook(payload: dict[str, Any]) -> None:
    event = payload.get("event")
    if not isinstance(event, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RevenueCat webhook payload",
        )

    event_id = event.get("id")
    if event_id:
        existing_event = await db.revenuecat_events.find_one(
            {"event_id": event_id},
            {"_id": 1},
        )
        if existing_event:
            return

    app_user_id = event.get("app_user_id")
    if not isinstance(app_user_id, str) or not app_user_id:
        await _record_revenuecat_event(event, payload, None)
        return

    user = await _find_user_for_revenuecat_event(event)
    if not user:
        await _record_revenuecat_event(event, payload, None)
        return

    if _get_revenuecat_api_key():
        await refresh_user_subscription_from_revenuecat(user, app_user_id)
    else:
        subscription = _subscription_from_event(event)
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "subscription": subscription,
                    "updated_at": _now(),
                }
            },
        )

    await _record_revenuecat_event(event, payload, user)


def _subscription_from_entitlement(
    entitlement: dict[str, Any] | None,
    subscriber: dict[str, Any] | None = None,
) -> dict[str, Any]:
    subscriber = subscriber or {}
    if not entitlement:
        return {
            **_default_subscription(),
            "management_url": subscriber.get("management_url"),
            "updated_at": _now(),
        }

    expires_at = _parse_revenuecat_datetime(
        _field(
            entitlement,
            [
                "expires_at",
                "expires_date",
                "expiration_date",
                "expiration_at",
                "expiration_at_ms",
                "expires_at_ms",
            ],
        )
    )
    grace_expires_at = _parse_revenuecat_datetime(
        _field(
            entitlement,
            [
                "grace_period_expires_date",
                "grace_period_expires_at",
            ],
        )
    )
    access_expires_at = expires_at
    if grace_expires_at and (not access_expires_at or grace_expires_at > access_expires_at):
        access_expires_at = grace_expires_at

    entitlement_id = _field(
        entitlement,
        ["entitlement_id", "entitlement_identifier", "identifier", "id"],
    )
    product_id = _field(
        entitlement,
        ["product_id", "product_identifier", "latest_product_identifier"],
    )
    subscriptions = subscriber.get("subscriptions")
    subscription = {}
    if isinstance(subscriptions, dict) and product_id:
        subscription = subscriptions.get(product_id) or {}

    unsubscribe_detected_at = _field(
        entitlement,
        ["unsubscribe_detected_at", "unsubscribeDetectedAt"],
    ) or subscription.get("unsubscribe_detected_at")
    billing_issue_detected_at = _field(
        entitlement,
        ["billing_issues_detected_at", "billingIssueDetectedAt"],
    ) or subscription.get("billing_issues_detected_at")

    active = access_expires_at is None or access_expires_at > _now()
    will_renew = _field(entitlement, ["will_renew", "willRenew"])
    if will_renew is None and active:
        will_renew = not bool(unsubscribe_detected_at or billing_issue_detected_at)

    is_sandbox = _field(entitlement, ["is_sandbox", "isSandbox"])
    if is_sandbox is None:
        is_sandbox = subscription.get("is_sandbox")

    return {
        "active": active,
        "entitlement_id": entitlement_id or settings.revenuecat_entitlement_id,
        "product_id": product_id,
        "store": entitlement.get("store") or subscription.get("store"),
        "environment": (
            entitlement.get("environment")
            or ("SANDBOX" if is_sandbox is True else "PRODUCTION" if is_sandbox is False else None)
        ),
        "expires_at": access_expires_at,
        "will_renew": will_renew,
        "management_url": subscriber.get("management_url"),
        "last_event_type": "REST_API_SYNC",
        "updated_at": _now(),
    }


def _subscription_from_customer_info(data: dict[str, Any]) -> dict[str, Any]:
    subscriber = data.get("subscriber") if isinstance(data, dict) else {}
    if not isinstance(subscriber, dict):
        subscriber = {}

    entitlements = subscriber.get("entitlements")
    if not isinstance(entitlements, dict):
        entitlements = {}

    entitlement = entitlements.get(settings.revenuecat_entitlement_id)
    if not isinstance(entitlement, dict):
        entitlement = None

    return _subscription_from_entitlement(entitlement, subscriber)


async def refresh_user_subscription_from_revenuecat(
    user: dict[str, Any],
    revenuecat_app_user_id: str | None = None,
) -> dict[str, Any]:
    api_key = _get_revenuecat_api_key()
    if not api_key:
        return serialize_subscription(user)

    customer_id = revenuecat_app_user_id or str(user["_id"])
    encoded_customer_id = quote(customer_id, safe="")
    url = f"{REVENUECAT_API_BASE}/subscribers/{encoded_customer_id}"

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not refresh subscription from RevenueCat",
        )

    subscription = _subscription_from_customer_info(response.json())

    subscription["revenuecat_app_user_id"] = customer_id
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "subscription": subscription,
                "updated_at": _now(),
            }
        },
    )

    updated_user = await db.users.find_one({"_id": user["_id"]})
    return serialize_subscription(updated_user or user)
