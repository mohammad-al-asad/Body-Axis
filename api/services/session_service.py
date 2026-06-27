from datetime import datetime, timezone
from typing import Any
import re

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo import ASCENDING, DESCENDING

from database import db
from schemas.management import TargetArea, UseCase
from schemas.sessions import (
    MovementSessionListResponse,
    MovementSessionResponse,
    SessionCreateRequest,
    movement_session_from_document,
)


TARGET_AREA_ALIASES = {
    "shoulderfront": "SHOULDER",
    "shoulderback": "SHOULDER",
    "shoulder": "SHOULDER",
    "core": "CORE",
    "outerhip": "OUTER HIP",
    "fronthip": "FRONT HIP",
    "footanklefront": "FOOT/ANKLE",
    "footankleback": "FOOT/ANKLE",
    "footankle": "FOOT/ANKLE",
    "neckupperback": "NECK/UPPER BACK",
    "middleback": "MIDDLE BACK",
    "sidelowerback": "SIDE LOWER BACK",
    "lowerback": "LOWER BACK",
    "glutes": "GLUTES",
    "backhip": "BACK HIP",
    "hamstring": "HAMSTRING",
    "calf": "CALF",
}

USE_CASE_ALIASES = {
    "stifftight": "Stiff or Tight",
    "stiffortight": "Stiff or Tight",
    "achesdiscomfort": "Aches or Discomfort",
    "achesordiscomfort": "Aches or Discomfort",
    "weakunstable": "Feels Weak or Unstable",
    "feelsweakorunstable": "Feels Weak or Unstable",
    "movebetter": "Just Want to Move Better",
    "justwanttomovebetter": "Just Want to Move Better",
}


async def ensure_session_indexes() -> None:
    await db.sessions.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await db.sessions.create_index([("target_areas", ASCENDING), ("user_case", ASCENDING)])


def _key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _normalize_target_area(value: str) -> str | None:
    raw = value.strip()
    if not raw:
        return None

    keyed = _key(raw)
    if keyed in TARGET_AREA_ALIASES:
        return TARGET_AREA_ALIASES[keyed]

    for target_area in TargetArea:
        if keyed == _key(target_area.value) or keyed == _key(target_area.name):
            return target_area.value

    return None


def _normalize_target_areas(payload: SessionCreateRequest) -> list[str]:
    values = []
    if payload.target_area:
        values.append(payload.target_area)
    values.extend(payload.target_areas)
    values.extend(payload.pain_points)

    normalized: list[str] = []
    invalid: list[str] = []
    for value in values:
        target_area = _normalize_target_area(value)
        if target_area:
            if target_area not in normalized:
                normalized.append(target_area)
        else:
            invalid.append(value)

    if invalid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported target area: {', '.join(invalid)}",
        )

    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one valid target area is required",
        )

    return normalized


def _normalize_use_case(payload: SessionCreateRequest) -> str:
    raw = (payload.user_case or payload.primary_goal or "").strip()
    keyed = _key(raw)

    if keyed in USE_CASE_ALIASES:
        return USE_CASE_ALIASES[keyed]

    for use_case in UseCase:
        if keyed == _key(use_case.value) or keyed == _key(use_case.name):
            return use_case.value

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Unsupported user case: {raw}",
    )


def _video_summary(video: dict[str, Any] | None) -> dict[str, Any] | None:
    if not video:
        return None
    return {
        "id": str(video["_id"]),
        "exercise_id": video["exercise_id"],
        "video_name": video["video_name"],
        "thumbnail_url": video["thumbnail_url"],
        "video_url": video["video_url"],
    }


async def _hydrate_plan(plan: dict[str, Any]) -> dict[str, Any]:
    phase_map = plan.get("phases", {})
    exercise_ids = [
        item.get("exercise_id")
        for items in phase_map.values()
        for item in items
        if item.get("exercise_id")
    ]
    exercises = {
        item["exercise_id"]: item
        async for item in db.exercises.find({"exercise_id": {"$in": exercise_ids}})
    }

    video_object_ids: list[ObjectId] = []
    for exercise in exercises.values():
        for key in ("tutorial_video_id", "short_clip_video_id"):
            video_id = exercise.get(key)
            if not video_id:
                continue
            try:
                video_object_ids.append(ObjectId(video_id))
            except InvalidId:
                continue

    videos = {
        str(video["_id"]): video
        async for video in db.videos.find({"_id": {"$in": video_object_ids}})
    }

    phases: dict[str, list[dict[str, Any]]] = {}
    exercise_count = 0
    all_equipment: list[str] = []
    for phase_name in ("reset", "control", "integrate"):
        phase_items: list[dict[str, Any]] = []
        for item in phase_map.get(phase_name, []):
            exercise = exercises.get(item.get("exercise_id"), {})
            tutorial_video = _video_summary(videos.get(exercise.get("tutorial_video_id")))
            short_clip_video = _video_summary(videos.get(exercise.get("short_clip_video_id")))

            equipment = exercise.get("equipment_needed") or item.get("equipment_needed") or []
            all_equipment.extend(equipment)

            phase_items.append(
                {
                    "exercise_id": item["exercise_id"],
                    "exercise_name": exercise.get("exercise_name")
                    or item.get("exercise_name")
                    or item["exercise_id"],
                    "sets": exercise.get("sets") or 1,
                    "reps": exercise.get("reps") or "1",
                    "phase": exercise.get("phase") or item.get("phase") or phase_name,
                    "equipment_needed": equipment,
                    "primary_intent": exercise.get("primary_intent"),
                    "secondary_benefits": exercise.get("secondary_benefits"),
                    "tutorial_video": tutorial_video,
                    "short_clip_video": short_clip_video,
                }
            )
        exercise_count += len(phase_items)
        phases[phase_name] = phase_items

    equipment_needed = list(dict.fromkeys(all_equipment))

    return {
        "id": str(plan["_id"]),
        "plan_id": plan["plan_id"],
        "plan_name": plan["plan_name"],
        "target_area": plan["target_area"],
        "use_case": plan["use_case"],
        "equipment_needed": equipment_needed,
        "duration": plan["duration"],
        "phases": phases,
        "status": plan.get("status", "published"),
        "_exercise_count": exercise_count,
    }


def _default_session_name(target_areas: list[str], user_case: str) -> str:
    target_label = " + ".join(
        " ".join(word.capitalize() for word in area.replace("/", " / ").split())
        for area in target_areas[:3]
    )
    if len(target_areas) > 3:
        target_label += f" + {len(target_areas) - 3} more"
    return f"{target_label} · {user_case}"


async def _hydrate_session(document: dict[str, Any]) -> dict[str, Any]:
    """Hydrate a session document by resolving plan references at read time.

    This ensures exercises and videos always reflect the latest data.
    """
    plan_ids = document.get("plan_ids", [])
    if not plan_ids:
        # Legacy sessions that still have embedded plans
        return movement_session_from_document(document)

    object_ids = []
    for pid in plan_ids:
        try:
            object_ids.append(ObjectId(pid))
        except InvalidId:
            continue

    plan_docs = await db.plans.find(
        {"_id": {"$in": object_ids}}
    ).sort("created_at", DESCENDING).to_list(length=None)

    plans: list[dict[str, Any]] = []
    exercise_count = 0
    for plan in plan_docs:
        hydrated = await _hydrate_plan(plan)
        exercise_count += hydrated.pop("_exercise_count", 0)
        plans.append(hydrated)

    result = movement_session_from_document(document)
    result["plans"] = plans
    result["plan_count"] = len(plans)
    result["exercise_count"] = exercise_count
    return result


async def create_user_session(
    current_user: dict[str, Any],
    payload: SessionCreateRequest,
) -> MovementSessionResponse:
    target_areas = _normalize_target_areas(payload)
    user_case = _normalize_use_case(payload)

    matching_plans = await db.plans.find(
        {
            "target_area": {"$in": target_areas},
            "use_case": user_case,
            "status": "published",
        }
    ).sort("created_at", DESCENDING).to_list(length=None)

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
        "plan_ids": [str(plan["_id"]) for plan in matching_plans],
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.sessions.insert_one(document)
    document["_id"] = result.inserted_id

    return MovementSessionResponse(**await _hydrate_session(document))


async def list_user_sessions(
    current_user: dict[str, Any],
) -> MovementSessionListResponse:
    query = {"user_id": str(current_user["_id"])}
    documents = await db.sessions.find(query).sort(
        "created_at",
        DESCENDING,
    ).to_list(length=None)
    items = []
    for document in documents:
        items.append(MovementSessionResponse(**await _hydrate_session(document)))
    return MovementSessionListResponse(
        items=items,
        total=len(documents),
    )


async def get_user_session(
    current_user: dict[str, Any],
    session_id: str,
) -> MovementSessionResponse:
    try:
        object_id = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Session not found") from None

    document = await db.sessions.find_one(
        {
            "_id": object_id,
            "user_id": str(current_user["_id"]),
        }
    )
    if not document:
        raise HTTPException(status_code=404, detail="Session not found")

    return MovementSessionResponse(**await _hydrate_session(document))
