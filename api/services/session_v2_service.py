from datetime import datetime, timezone
from typing import Any
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo import DESCENDING

from database import db
from schemas.sessions import (
    MovementSessionResponse,
    SessionPlanResponse,
)
from schemas.sessions_v2 import (
    MatchingPlansRequest,
    MatchingPlansResponse,
    SessionCreateRequestV2,
)
from services.session_service import (
    _build_session_progress_document,
    _default_session_name,
    _hydrate_plan,
    _hydrate_session,
    _matching_plan_durations,
    _matching_target_areas,
    _matching_use_cases,
    _normalize_target_areas,
    _normalize_use_case,
)


async def get_matching_plans_v2(
    payload: MatchingPlansRequest,
) -> MatchingPlansResponse:
    target_areas = _normalize_target_areas(payload)
    user_case = _normalize_use_case(payload)

    plan_query: dict[str, Any] = {
        "target_area": {"$in": _matching_target_areas(target_areas)},
        "use_case": {"$in": _matching_use_cases(user_case)},
        "status": "published",
    }
    matching_durations = _matching_plan_durations(payload.session_duration)
    if matching_durations:
        plan_query["duration"] = {"$in": matching_durations}

    matching_plans = await db.plans.find(plan_query).sort(
        "created_at",
        DESCENDING,
    ).to_list(length=None)

    items: list[SessionPlanResponse] = []
    for plan in matching_plans:
        hydrated = await _hydrate_plan(plan)
        hydrated.pop("_exercise_count", None)
        items.append(SessionPlanResponse(**hydrated))

    return MatchingPlansResponse(items=items, total=len(items))


async def create_user_session_v2(
    current_user: dict[str, Any],
    payload: SessionCreateRequestV2,
) -> MovementSessionResponse:
    target_areas = _normalize_target_areas(payload)
    user_case = _normalize_use_case(payload)

    if payload.plan_ids:
        object_ids: list[ObjectId] = []
        slug_ids: list[str] = []
        for pid in payload.plan_ids:
            try:
                object_ids.append(ObjectId(pid))
            except InvalidId:
                slug_ids.append(pid)

        query_conditions: list[dict[str, Any]] = []
        if object_ids:
            query_conditions.append({"_id": {"$in": object_ids}})
        if slug_ids:
            query_conditions.append({"plan_id": {"$in": slug_ids}})

        if not query_conditions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid plan identifiers provided.",
            )

        plan_query: dict[str, Any] = {
            "$or": query_conditions,
            "status": "published",
        }
        selected_plans = await db.plans.find(plan_query).sort(
            "created_at",
            DESCENDING,
        ).to_list(length=None)

        if not selected_plans:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected movement plans were not found or are no longer available.",
            )
    else:
        plan_query = {
            "target_area": {"$in": _matching_target_areas(target_areas)},
            "use_case": {"$in": _matching_use_cases(user_case)},
            "status": "published",
        }
        matching_durations = _matching_plan_durations(payload.session_duration)
        if matching_durations:
            plan_query["duration"] = {"$in": matching_durations}

        selected_plans = await db.plans.find(plan_query).sort(
            "created_at",
            DESCENDING,
        ).to_list(length=None)

        if not selected_plans:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No movement plans found for the selected configuration. Please choose a different target area, goal, or duration.",
            )

    now = datetime.now(timezone.utc)
    document = {
        "user_id": str(current_user["_id"]),
        "session_name": (
            payload.session_name.strip()
            if payload.session_name and payload.session_name.strip()
            else _default_session_name(target_areas, user_case)
        ),
        "target_areas": target_areas,
        "user_case": user_case,
        "schedule_days": payload.schedule_days,
        "schedule_weeks": payload.schedule_weeks,
        "session_duration": payload.session_duration,
        "plan_ids": [str(plan["_id"]) for plan in selected_plans],
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.sessions.insert_one(document)
    document["_id"] = result.inserted_id

    hydrated_plans = []
    for plan in selected_plans:
        hydrated = await _hydrate_plan(plan)
        hydrated.pop("_exercise_count", None)
        hydrated_plans.append(hydrated)

    progress_document = _build_session_progress_document(
        current_user,
        document,
        hydrated_plans,
    )
    await db.session_progress.insert_one(progress_document)
    await db.user_progress_summaries.update_one(
        {"user_id": str(current_user["_id"])},
        {
            "$setOnInsert": {
                "user_id": str(current_user["_id"]),
                "current_streak_days": 0,
                "completed_dates": [],
                "sessions_completed_total": 0,
                "total_exercises_completed": 0,
                "updated_at": now,
            }
        },
        upsert=True,
    )

    return MovementSessionResponse(**await _hydrate_session(document))
