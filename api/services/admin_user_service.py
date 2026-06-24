from datetime import date, datetime, time, timedelta, timezone
from math import ceil
from typing import Any
import re

from pymongo import DESCENDING

from database import db
from schemas.admin_users import AdminUserListResponse
from services.subscription_service import serialize_subscription

EXPIRING_SOON_DAYS = 14


def _utc_datetime(value: date, end_of_day: bool = False) -> datetime:
    return datetime.combine(
        value,
        time.max if end_of_day else time.min,
        tzinfo=timezone.utc,
    )


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _as_date(value: Any) -> date | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str) and value:
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _search_condition(value: str) -> dict[str, Any] | None:
    text = value.strip()
    if not text:
        return None

    pattern = re.escape(text)
    return {
        "$or": [
            {"full_name": {"$regex": pattern, "$options": "i"}},
            {"email": {"$regex": pattern, "$options": "i"}},
        ]
    }


def _normalize_status(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip().lower().replace("-", " ").replace("_", " ")
    return {
        "active": "Active",
        "expiring soon": "Expiring Soon",
        "expired": "Expired",
        "no plan": "No Plan",
        "inactive": "No Plan",
    }.get(normalized)


def _humanize_product_id(product_id: str | None) -> str:
    if not product_id:
        return "No active plan"

    identifier = product_id.split(":")[-1]
    return " ".join(
        part.capitalize()
        for part in identifier.replace("_", "-").split("-")
        if part
    ) or product_id


def _subscription_status(user: dict[str, Any]) -> str:
    subscription = serialize_subscription(user)
    expires_at = _as_utc(subscription.get("expires_at"))

    if subscription.get("active"):
        if (
            expires_at
            and expires_at <= datetime.now(timezone.utc) + timedelta(days=EXPIRING_SOON_DAYS)
        ):
            return "Expiring Soon"
        return "Active"

    if subscription.get("product_id") or expires_at:
        return "Expired"

    return "No Plan"


def _int_from_paths(user: dict[str, Any], paths: list[tuple[str, ...]]) -> int | None:
    for path in paths:
        value: Any = user
        for key in path:
            if not isinstance(value, dict):
                value = None
                break
            value = value.get(key)

        if isinstance(value, bool):
            continue
        if isinstance(value, int):
            return max(value, 0)
        if isinstance(value, list):
            return len(value)
        if isinstance(value, str) and value.isdigit():
            return int(value)
    return None


def _total_plans(user: dict[str, Any]) -> int:
    return _int_from_paths(
        user,
        [
            ("total_plans",),
            ("plan_count",),
            ("plans_total",),
            ("assigned_plan_count",),
            ("assigned_plans",),
            ("plans",),
        ],
    ) or 0


def _sessions(user: dict[str, Any]) -> int:
    return _int_from_paths(
        user,
        [
            ("sessions_completed",),
            ("completed_sessions",),
            ("session_count",),
            ("progress", "sessions_completed"),
            ("progress", "completed_sessions"),
            ("sessions",),
        ],
    ) or 0


def _current_plan(user: dict[str, Any]) -> str:
    for path in (
        ("current_plan", "plan_name"),
        ("current_plan_name",),
        ("assigned_plan", "plan_name"),
        ("plan", "plan_name"),
    ):
        value: Any = user
        for key in path:
            if not isinstance(value, dict):
                value = None
                break
            value = value.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    subscription = serialize_subscription(user)
    return _humanize_product_id(subscription.get("product_id"))


def _serialize_admin_user(user: dict[str, Any]) -> dict[str, Any]:
    email = str(user.get("email") or "")
    return {
        "id": str(user["_id"]),
        "name": user.get("full_name") or email.split("@")[0] or "Unnamed user",
        "date_of_birth": _as_date(user.get("date_of_birth")),
        "email": email,
        "join_date": _as_utc(user.get("created_at")),
        "current_plan": _current_plan(user),
        "total": _total_plans(user),
        "status": _subscription_status(user),
        "sessions": _sessions(user),
    }


async def get_admin_users(
    page: int,
    page_size: int,
    search: str | None = None,
    global_search: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    status: str | None = None,
) -> AdminUserListResponse:
    query: dict[str, Any] = {}
    conditions: list[dict[str, Any]] = []

    for value in (global_search, search):
        condition = _search_condition(value or "")
        if condition:
            conditions.append(condition)

    created_at_query: dict[str, datetime] = {}
    if start_date:
        created_at_query["$gte"] = _utc_datetime(start_date)
    if end_date:
        created_at_query["$lte"] = _utc_datetime(end_date, end_of_day=True)
    if created_at_query:
        query["created_at"] = created_at_query

    if conditions:
        query["$and"] = conditions

    projection = {
        "full_name": 1,
        "email": 1,
        "date_of_birth": 1,
        "created_at": 1,
        "subscription": 1,
        "current_plan": 1,
        "current_plan_name": 1,
        "assigned_plan": 1,
        "assigned_plans": 1,
        "plan": 1,
        "plans": 1,
        "total_plans": 1,
        "plan_count": 1,
        "plans_total": 1,
        "assigned_plan_count": 1,
        "sessions_completed": 1,
        "completed_sessions": 1,
        "session_count": 1,
        "progress": 1,
        "sessions": 1,
    }

    documents = await db.users.find(query, projection).sort(
        "created_at",
        DESCENDING,
    ).to_list(length=None)

    rows = [_serialize_admin_user(user) for user in documents]

    normalized_status = _normalize_status(status)
    if normalized_status:
        rows = [row for row in rows if row["status"] == normalized_status]

    total = len(rows)
    total_pages = ceil(total / page_size) if total else 0
    safe_page = min(page, total_pages) if total_pages else 1
    start = (safe_page - 1) * page_size
    end = start + page_size

    return AdminUserListResponse(
        items=rows[start:end],
        total=total,
        page=safe_page,
        page_size=page_size,
        total_pages=total_pages,
    )
