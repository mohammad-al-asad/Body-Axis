from datetime import date, datetime, timedelta, timezone
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
    ProgressAchievementResponse,
    ProgressSummaryResponse,
    SessionExerciseCompleteRequest,
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
    await db.session_progress.create_index(
        [("user_id", ASCENDING), ("session_id", ASCENDING)],
        unique=True,
    )
    await db.session_progress.create_index([("user_id", ASCENDING), ("updated_at", DESCENDING)])
    await db.user_progress_summaries.create_index("user_id", unique=True)


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


def _flatten_plan_exercises(plan: dict[str, Any]) -> list[dict[str, Any]]:
    exercises: list[dict[str, Any]] = []
    for phase_name in ("reset", "control", "integrate"):
        for exercise in plan.get("phases", {}).get(phase_name, []):
            exercises.append(
                {
                    "exercise_id": exercise["exercise_id"],
                    "exercise_name": exercise["exercise_name"],
                    "phase": exercise["phase"],
                    "is_completed": False,
                    "completed_at": None,
                }
            )
    return exercises


def _calculate_percent(completed: int, total: int) -> int:
    if total <= 0:
        return 0
    return round((completed / total) * 100)


def _build_session_progress_document(
    current_user: dict[str, Any],
    session_document: dict[str, Any],
    hydrated_plans: list[dict[str, Any]],
) -> dict[str, Any]:
    plan_progress = []
    total_exercise_count = 0
    for plan in hydrated_plans:
        exercises = _flatten_plan_exercises(plan)
        total_exercise_count += len(exercises)
        plan_progress.append(
            {
                "plan_id": plan["plan_id"],
                "plan_name": plan["plan_name"],
                "status": "pending",
                "progress_percent": 0,
                "completed_exercise_count": 0,
                "total_exercise_count": len(exercises),
                "exercises": exercises,
            }
        )

    return {
        "user_id": str(current_user["_id"]),
        "session_id": str(session_document["_id"]),
        "status": "pending",
        "progress_percent": 0,
        "completed_exercise_count": 0,
        "total_exercise_count": total_exercise_count,
        "plans": plan_progress,
        "completed_dates": [],
        "created_at": session_document["created_at"],
        "updated_at": session_document["updated_at"],
    }


async def _get_session_progress_document(user_id: str, session_id: str) -> dict[str, Any] | None:
    return await db.session_progress.find_one({"user_id": user_id, "session_id": session_id})


def _find_next_exercise(
    session_document: dict[str, Any],
    session_progress: dict[str, Any] | None,
    hydrated_plans: list[dict[str, Any]],
) -> dict[str, Any] | None:
    if not session_progress:
        return None

    plans_by_id = {plan["plan_id"]: plan for plan in hydrated_plans}
    for plan_progress in session_progress.get("plans", []):
        if plan_progress.get("status") == "completed":
            continue
        hydrated_plan = plans_by_id.get(plan_progress["plan_id"])
        if not hydrated_plan:
            continue
        exercises_by_id = {
            exercise["exercise_id"]: exercise
            for phase_items in hydrated_plan.get("phases", {}).values()
            for exercise in phase_items
        }
        for exercise_index, progress_exercise in enumerate(plan_progress.get("exercises", [])):
            if progress_exercise.get("is_completed"):
                continue
            hydrated_exercise = exercises_by_id.get(progress_exercise["exercise_id"])
            if not hydrated_exercise:
                continue
            return {
                "session_id": str(session_document["_id"]),
                "session_name": session_document["session_name"],
                "plan_id": hydrated_plan["plan_id"],
                "plan_name": hydrated_plan["plan_name"],
                "exercise_id": hydrated_exercise["exercise_id"],
                "exercise_name": hydrated_exercise["exercise_name"],
                "exercise_index": exercise_index,
                "phase": hydrated_exercise["phase"],
                "tutorial_video": hydrated_exercise.get("tutorial_video"),
                "short_clip_video": hydrated_exercise.get("short_clip_video"),
                "primary_intent": hydrated_exercise.get("primary_intent"),
                "secondary_benefits": hydrated_exercise.get("secondary_benefits"),
            }
    return None


def _merge_progress_into_plans(
    hydrated_plans: list[dict[str, Any]],
    session_progress: dict[str, Any] | None,
) -> list[dict[str, Any]]:
    progress_by_plan = (
        {
            plan["plan_id"]: plan
            for plan in session_progress.get("plans", [])
        }
        if session_progress
        else {}
    )
    merged_plans = []
    for plan in hydrated_plans:
        progress_plan = progress_by_plan.get(plan["plan_id"])
        exercise_progress_by_id = (
            {
                exercise["exercise_id"]: exercise
                for exercise in progress_plan.get("exercises", [])
            }
            if progress_plan
            else {}
        )
        merged_phases: dict[str, list[dict[str, Any]]] = {}
        for phase_name, exercises in plan.get("phases", {}).items():
            merged_phases[phase_name] = [
                {
                    **exercise,
                    "is_completed": exercise_progress_by_id.get(exercise["exercise_id"], {}).get(
                        "is_completed",
                        False,
                    ),
                    "completed_at": exercise_progress_by_id.get(exercise["exercise_id"], {}).get(
                        "completed_at"
                    ),
                }
                for exercise in exercises
            ]

        merged_plans.append(
            {
                **plan,
                "phases": merged_phases,
                "progress_status": progress_plan.get("status", "pending") if progress_plan else "pending",
                "progress_percent": progress_plan.get("progress_percent", 0) if progress_plan else 0,
                "completed_exercise_count": progress_plan.get("completed_exercise_count", 0) if progress_plan else 0,
                "total_exercise_count": progress_plan.get("total_exercise_count", 0) if progress_plan else sum(
                    len(items) for items in plan.get("phases", {}).values()
                ),
            }
        )
    return merged_plans


def _week_dates_for(local_today: date) -> list[str]:
    monday = local_today - timedelta(days=local_today.weekday())
    return [
        (monday + timedelta(days=offset)).isoformat()
        for offset in range(7)
    ]


def _calculate_streak_from_dates(completed_dates: list[str]) -> int:
    if not completed_dates:
        return 0
    unique_dates = sorted(set(completed_dates))
    date_objects = [date.fromisoformat(value) for value in unique_dates]
    streak = 1
    for index in range(len(date_objects) - 1, 0, -1):
        if (date_objects[index] - date_objects[index - 1]).days == 1:
            streak += 1
        else:
            break
    return streak


def _build_wins(summary: dict[str, Any]) -> list[dict[str, Any]]:
    streak = summary.get("current_streak_days", 0)
    sessions_completed_total = summary.get("sessions_completed_total", 0)
    total_exercises_completed = summary.get("total_exercises_completed", 0)
    completed_dates = summary.get("completed_dates", [])
    has_first_logged_session = (
        sessions_completed_total >= 1
        or total_exercises_completed >= 1
        or len(completed_dates) >= 1
    )

    return [
        {
            "key": "first_session",
            "title": "First Session",
            "unlocked": has_first_logged_session,
        },
        {
            "key": "7_day_streak",
            "title": "7-Day Streak",
            "unlocked": streak >= 7,
        },
        {
            "key": "10_exercises",
            "title": "10 Exercises Completed",
            "unlocked": total_exercises_completed >= 10,
        },
    ]


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

    session_progress = await _get_session_progress_document(
        str(document["user_id"]),
        str(document["_id"]),
    )
    merged_plans = _merge_progress_into_plans(plans, session_progress)
    next_exercise = _find_next_exercise(document, session_progress, merged_plans)

    result = movement_session_from_document(document)
    result["plans"] = merged_plans
    result["plan_count"] = len(merged_plans)
    result["exercise_count"] = exercise_count
    result["total_exercise_count"] = (
        session_progress.get("total_exercise_count", exercise_count)
        if session_progress
        else exercise_count
    )
    result["completed_exercise_count"] = (
        session_progress.get("completed_exercise_count", 0) if session_progress else 0
    )
    result["progress_percent"] = session_progress.get("progress_percent", 0) if session_progress else 0
    result["next_exercise"] = next_exercise
    result["status"] = document.get("status", session_progress.get("status", "pending") if session_progress else "pending")
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
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.sessions.insert_one(document)
    document["_id"] = result.inserted_id

    hydrated_plans = []
    for plan in matching_plans:
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


async def list_user_sessions(
    current_user: dict[str, Any],
) -> MovementSessionListResponse:
    query = {"user_id": str(current_user["_id"])}
    documents = await db.sessions.find(query).sort(
        "created_at",
        DESCENDING,
    ).to_list(length=None)
    items = [MovementSessionResponse(**await _hydrate_session(document)) for document in documents]
    items.sort(
        key=lambda item: (
            item.status == "completed",
            -item.updated_at.timestamp(),
        )
    )
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


async def complete_session_exercise(
    current_user: dict[str, Any],
    session_id: str,
    exercise_id: str,
    payload: SessionExerciseCompleteRequest,
) -> MovementSessionResponse:
    try:
        session_object_id = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Session not found") from None

    session = await db.sessions.find_one(
        {
            "_id": session_object_id,
            "user_id": str(current_user["_id"]),
        }
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    progress = await _get_session_progress_document(str(current_user["_id"]), session_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Session progress not found")

    now = datetime.now(timezone.utc)
    session_completed_before = progress.get("status") == "completed"
    exercise_found = False

    for plan_progress in progress.get("plans", []):
        if plan_progress.get("plan_id") != payload.plan_id:
            continue
        for progress_exercise in plan_progress.get("exercises", []):
            if progress_exercise.get("exercise_id") != exercise_id:
                continue
            exercise_found = True
            if not progress_exercise.get("is_completed"):
                progress_exercise["is_completed"] = True
                progress_exercise["completed_at"] = now
            break

    if not exercise_found:
        raise HTTPException(status_code=404, detail="Exercise not found in session progress")

    completed_exercise_count = 0
    total_exercise_count = 0
    for plan_progress in progress.get("plans", []):
        plan_total = len(plan_progress.get("exercises", []))
        plan_completed = sum(
            1 for exercise in plan_progress.get("exercises", [])
            if exercise.get("is_completed")
        )
        plan_progress["total_exercise_count"] = plan_total
        plan_progress["completed_exercise_count"] = plan_completed
        plan_progress["progress_percent"] = _calculate_percent(plan_completed, plan_total)
        if plan_completed == 0:
            plan_progress["status"] = "pending"
        elif plan_completed >= plan_total and plan_total > 0:
            plan_progress["status"] = "completed"
        else:
            plan_progress["status"] = "active"
        completed_exercise_count += plan_completed
        total_exercise_count += plan_total

    progress["completed_exercise_count"] = completed_exercise_count
    progress["total_exercise_count"] = total_exercise_count
    progress["progress_percent"] = _calculate_percent(completed_exercise_count, total_exercise_count)
    if completed_exercise_count == 0:
        progress["status"] = "pending"
    elif completed_exercise_count >= total_exercise_count and total_exercise_count > 0:
        progress["status"] = "completed"
    else:
        progress["status"] = "active"
    progress["updated_at"] = now

    completed_dates = list(dict.fromkeys(progress.get("completed_dates", [])))
    if payload.completed_local_date not in completed_dates:
        completed_dates.append(payload.completed_local_date)
    progress["completed_dates"] = sorted(completed_dates)

    await db.session_progress.update_one(
        {"_id": progress["_id"]},
        {
            "$set": {
                "plans": progress["plans"],
                "completed_exercise_count": progress["completed_exercise_count"],
                "total_exercise_count": progress["total_exercise_count"],
                "progress_percent": progress["progress_percent"],
                "status": progress["status"],
                "completed_dates": progress["completed_dates"],
                "updated_at": now,
            }
        },
    )

    await db.sessions.update_one(
        {"_id": session["_id"]},
        {
            "$set": {
                "status": progress["status"],
                "updated_at": now,
            }
        },
    )

    summary = await db.user_progress_summaries.find_one({"user_id": str(current_user["_id"])})
    summary_dates = list(dict.fromkeys((summary or {}).get("completed_dates", [])))
    if payload.completed_local_date not in summary_dates:
        summary_dates.append(payload.completed_local_date)
    summary_dates = sorted(summary_dates)
    sessions_completed_total = int((summary or {}).get("sessions_completed_total", 0))
    if progress["status"] == "completed" and not session_completed_before:
        sessions_completed_total += 1
    total_exercises_completed = sum(
        item.get("completed_exercise_count", 0)
        for item in await db.session_progress.find({"user_id": str(current_user["_id"])}).to_list(length=None)
    )

    await db.user_progress_summaries.update_one(
        {"user_id": str(current_user["_id"])},
        {
            "$set": {
                "completed_dates": summary_dates,
                "current_streak_days": _calculate_streak_from_dates(summary_dates),
                "sessions_completed_total": sessions_completed_total,
                "total_exercises_completed": total_exercises_completed,
                "updated_at": now,
            },
            "$setOnInsert": {
                "user_id": str(current_user["_id"]),
            },
        },
        upsert=True,
    )

    updated_session = await db.sessions.find_one({"_id": session["_id"]})
    return MovementSessionResponse(**await _hydrate_session(updated_session))


async def get_user_progress_summary(
    current_user: dict[str, Any],
) -> ProgressSummaryResponse:
    user_id = str(current_user["_id"])
    summary = await db.user_progress_summaries.find_one({"user_id": user_id}) or {
        "user_id": user_id,
        "current_streak_days": 0,
        "completed_dates": [],
        "sessions_completed_total": 0,
        "total_exercises_completed": 0,
    }

    sessions = await list_user_sessions(current_user)
    active_session = next((item for item in sessions.items if item.status != "completed"), None)
    next_exercise = next((item.next_exercise for item in sessions.items if item.next_exercise), None)

    completed_dates = summary.get("completed_dates", [])
    week_dates = _week_dates_for(datetime.now(timezone.utc).date())
    completed_dates_this_week = [value for value in week_dates if value in completed_dates]
    weekly_target_count = (
        active_session.schedule_days if active_session and active_session.schedule_days else 7
    )

    summary_payload = {
        "current_streak_days": summary.get("current_streak_days", 0),
        "completed_dates_this_week": completed_dates_this_week,
        "weekly_completed_count": len(completed_dates_this_week),
        "weekly_target_count": weekly_target_count,
        "sessions_completed_total": summary.get("sessions_completed_total", 0),
        "total_exercises_completed": summary.get("total_exercises_completed", 0),
        "active_session": active_session.model_dump() if active_session else None,
        "next_exercise": next_exercise.model_dump() if next_exercise else None,
        "wins": _build_wins(summary),
    }
    return ProgressSummaryResponse(**summary_payload)
