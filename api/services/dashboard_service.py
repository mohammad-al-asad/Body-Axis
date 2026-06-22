from calendar import month_abbr
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Literal

from database import db
from schemas.dashboard import DashboardAnalyticsResponse

ACTIVE_USER_WINDOW_DAYS = 30


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


def _percentage_change(current: int, previous: int) -> float | None:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)


def _period_start(value: datetime, granularity: str) -> date:
    day = value.date()
    if granularity == "weekly":
        return day - timedelta(days=day.weekday())
    if granularity == "monthly":
        return day.replace(day=1)
    return day


def _next_period(value: date, granularity: str) -> date:
    if granularity == "weekly":
        return value + timedelta(days=7)
    if granularity == "monthly":
        return (
            value.replace(year=value.year + 1, month=1)
            if value.month == 12
            else value.replace(month=value.month + 1)
        )
    return value + timedelta(days=1)


def _period_label(value: date, granularity: str) -> str:
    if granularity == "weekly":
        return f"{value.day:02d} {month_abbr[value.month].upper()}"
    if granularity == "monthly":
        return f"{month_abbr[value.month].upper()} {str(value.year)[2:]}"
    return f"{value.day:02d} {month_abbr[value.month].upper()}"


async def get_dashboard_analytics(
    granularity: Literal["daily", "weekly", "monthly"],
    start_date: date,
    end_date: date,
) -> DashboardAnalyticsResponse:
    now = datetime.now(timezone.utc)
    active_since = now - timedelta(days=ACTIVE_USER_WINDOW_DAYS)
    current_window_start = active_since
    previous_window_start = current_window_start - timedelta(
        days=ACTIVE_USER_WINDOW_DAYS
    )

    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents(
        {"last_login_at": {"$gte": active_since}}
    )
    total_plans = await db.plans.count_documents({})
    total_exercises = await db.exercises.count_documents({})

    current_new_users = await db.users.count_documents(
        {"created_at": {"$gte": current_window_start, "$lte": now}}
    )
    previous_new_users = await db.users.count_documents(
        {
            "created_at": {
                "$gte": previous_window_start,
                "$lt": current_window_start,
            }
        }
    )
    current_active = active_users
    previous_active = await db.users.count_documents(
        {
            "last_login_at": {
                "$gte": previous_window_start,
                "$lt": current_window_start,
            }
        }
    )
    current_plans = await db.plans.count_documents(
        {"created_at": {"$gte": current_window_start, "$lte": now}}
    )
    previous_plans = await db.plans.count_documents(
        {
            "created_at": {
                "$gte": previous_window_start,
                "$lt": current_window_start,
            }
        }
    )
    current_exercises = await db.exercises.count_documents(
        {"created_at": {"$gte": current_window_start, "$lte": now}}
    )
    previous_exercises = await db.exercises.count_documents(
        {
            "created_at": {
                "$gte": previous_window_start,
                "$lt": current_window_start,
            }
        }
    )

    range_start = _utc_datetime(start_date)
    range_end = _utc_datetime(end_date, end_of_day=True)
    users_in_range = await db.users.find(
        {
            "$or": [
                {"created_at": {"$gte": range_start, "$lte": range_end}},
                {"last_login_at": {"$gte": range_start, "$lte": range_end}},
            ]
        },
        {
            "full_name": 1,
            "email": 1,
            "auth_provider": 1,
            "created_at": 1,
            "last_login_at": 1,
            "is_intake_completed": 1,
        },
    ).to_list(length=None)

    first_period = _period_start(range_start, granularity)
    periods: dict[date, dict[str, int]] = {}
    cursor = first_period
    while cursor <= end_date:
        periods[cursor] = {
            "registrations": 0,
            "active_users": 0,
            "intake_completed": 0,
        }
        cursor = _next_period(cursor, granularity)

    for user in users_in_range:
        created_at = _as_utc(user.get("created_at"))
        last_login_at = _as_utc(user.get("last_login_at"))

        if created_at and range_start <= created_at <= range_end:
            key = _period_start(created_at, granularity)
            if key in periods:
                periods[key]["registrations"] += 1
                if user.get("is_intake_completed", False):
                    periods[key]["intake_completed"] += 1

        if last_login_at and range_start <= last_login_at <= range_end:
            key = _period_start(last_login_at, granularity)
            if key in periods:
                periods[key]["active_users"] += 1

    growth = []
    for period, values in periods.items():
        registrations = values["registrations"]
        completion = (
            round((values["intake_completed"] / registrations) * 100)
            if registrations
            else 0
        )
        growth.append(
            {
                "label": _period_label(period, granularity),
                "period_start": period,
                **values,
                "intake_completion_percent": completion,
            }
        )

    recent_documents = await db.users.find(
        {},
        {
            "full_name": 1,
            "email": 1,
            "auth_provider": 1,
            "created_at": 1,
            "last_login_at": 1,
        },
    ).sort("created_at", -1).limit(5).to_list(length=5)

    recent_users: list[dict[str, Any]] = []
    for user in recent_documents:
        last_login = _as_utc(user.get("last_login_at"))
        recent_users.append(
            {
                "id": str(user["_id"]),
                "name": user.get("full_name") or user["email"].split("@")[0],
                "email": user["email"],
                "auth_provider": user.get("auth_provider", "password"),
                "created_at": _as_utc(user["created_at"]),
                "last_login_at": last_login,
                "active": bool(last_login and last_login >= active_since),
            }
        )

    return DashboardAnalyticsResponse(
        stats={
            "total_users": {
                "value": total_users,
                "change_percent": _percentage_change(
                    current_new_users,
                    previous_new_users,
                ),
            },
            "active_users": {
                "value": active_users,
                "change_percent": _percentage_change(
                    current_active,
                    previous_active,
                ),
            },
            "total_plans": {
                "value": total_plans,
                "change_percent": _percentage_change(
                    current_plans,
                    previous_plans,
                ),
            },
            "total_exercises": {
                "value": total_exercises,
                "change_percent": _percentage_change(
                    current_exercises,
                    previous_exercises,
                ),
            },
        },
        user_growth=growth,
        recent_users=recent_users,
        active_user_window_days=ACTIVE_USER_WINDOW_DAYS,
    )
