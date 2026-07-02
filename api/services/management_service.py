from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, UploadFile, status
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool

from database import db
from schemas.management import (
    ExerciseCreate,
    ExerciseResponse,
    ExerciseUpdate,
    PlanCreate,
    PlanResponse,
    PlanUpdate,
)
from services.s3_service import (
    complete_multipart_upload,
    delete_file,
    upload_file,
)


async def ensure_management_indexes() -> None:
    await db.videos.create_index([("exercise_id", ASCENDING)])
    await db.videos.create_index([("created_at", DESCENDING)])
    await db.exercises.create_index("exercise_id", unique=True)
    await db.exercises.create_index([("phase", ASCENDING), ("exercise_name", ASCENDING)])
    await db.plans.create_index("plan_id", unique=True)
    await db.plans.create_index([("created_at", DESCENDING)])


def _object_id(value: str, resource: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
        ) from None


def _video_summary(video: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(video["_id"]),
        "exercise_id": video["exercise_id"],
        "video_name": video["video_name"],
        "thumbnail_url": video["thumbnail_url"],
        "video_url": video["video_url"],
    }


def serialize_video(video: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(video["_id"]),
        "exercise_id": video["exercise_id"],
        "video_name": video["video_name"],
        "video_description": video["video_description"],
        "thumbnail_url": video["thumbnail_url"],
        "video_url": video["video_url"],
        "thumbnail_key": video.get("thumbnail_key"),
        "video_key": video.get("video_key"),
        "video_file_name": video.get("video_file_name"),
        "video_file_size": video.get("video_file_size"),
        "created_at": video["created_at"],
        "updated_at": video["updated_at"],
    }


async def serialize_exercise(exercise: dict[str, Any]) -> dict[str, Any]:
    video_ids = [
        _object_id(exercise["tutorial_video_id"], "Tutorial video"),
        _object_id(exercise["short_clip_video_id"], "Short clip video"),
    ]
    videos = {
        str(item["_id"]): item
        async for item in db.videos.find({"_id": {"$in": video_ids}})
    }
    tutorial = videos.get(exercise["tutorial_video_id"])
    short_clip = videos.get(exercise["short_clip_video_id"])
    if not tutorial or not short_clip:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Exercise references a video that no longer exists",
        )

    return {
        "id": str(exercise["_id"]),
        "exercise_id": exercise["exercise_id"],
        "exercise_name": exercise["exercise_name"],
        "sets": exercise["sets"],
        "reps": exercise["reps"],
        "primary_intent": exercise["primary_intent"],
        "secondary_benefits": exercise["secondary_benefits"],
        "equipment_needed": exercise.get("equipment_needed", []),
        "phase": exercise["phase"],
        "tutorial_video_id": exercise["tutorial_video_id"],
        "short_clip_video_id": exercise["short_clip_video_id"],
        "tutorial_video": _video_summary(tutorial),
        "short_clip_video": _video_summary(short_clip),
        "status": exercise.get("status", "published"),
        "created_at": exercise["created_at"],
        "updated_at": exercise["updated_at"],
    }


async def serialize_plan(plan: dict[str, Any]) -> dict[str, Any]:
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

    phases: dict[str, list[dict[str, Any]]] = {}
    all_equipment: list[str] = []
    for phase_name in ("reset", "control", "integrate"):
        phase_items: list[dict[str, Any]] = []
        for item in phase_map.get(phase_name, []):
            exercise = exercises.get(item.get("exercise_id"), {})
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
                }
            )
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
        "created_at": plan["created_at"],
        "updated_at": plan["updated_at"],
    }


async def create_video(
    exercise_id: str,
    video_name: str,
    video_description: str,
    thumbnail: UploadFile,
    video_file: UploadFile | None = None,
    video_upload_key: str | None = None,
    video_upload_id: str | None = None,
    video_upload_parts: list[dict[str, Any]] | None = None,
    video_file_name: str | None = None,
    video_file_size: int | None = None,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    thumbnail_url, thumbnail_key = await run_in_threadpool(
        upload_file,
        thumbnail.file,
        thumbnail.filename,
        thumbnail.content_type,
        "thumbnails",
    )
    try:
        if video_file is not None:
            video_url, video_key = await run_in_threadpool(
                upload_file,
                video_file.file,
                video_file.filename,
                video_file.content_type,
                "videos",
            )
            resolved_video_name = video_file.filename
            resolved_video_size = video_file.size
        elif video_upload_key and video_upload_id and video_upload_parts:
            video_url, video_key = await run_in_threadpool(
                complete_multipart_upload,
                video_upload_key,
                video_upload_id,
                video_upload_parts,
            )
            resolved_video_name = video_file_name
            resolved_video_size = video_file_size
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="A completed video upload is required",
            )
    except HTTPException:
        await run_in_threadpool(delete_file, thumbnail_key)
        raise

    document = {
        "exercise_id": exercise_id.strip(),
        "video_name": video_name.strip(),
        "video_description": video_description.strip(),
        "thumbnail_url": thumbnail_url,
        "thumbnail_key": thumbnail_key,
        "video_url": video_url,
        "video_key": video_key,
        "video_file_name": resolved_video_name,
        "video_file_size": resolved_video_size,
        "created_at": now,
        "updated_at": now,
    }
    try:
        result = await db.videos.insert_one(document)
    except Exception:
        await run_in_threadpool(delete_file, thumbnail_key)
        await run_in_threadpool(delete_file, video_key)
        raise
    document["_id"] = result.inserted_id
    return serialize_video(document)


async def update_video(
    video_id: str,
    exercise_id: str,
    video_name: str,
    video_description: str,
    thumbnail: UploadFile | None,
    video_file: UploadFile | None,
    video_upload_key: str | None = None,
    video_upload_id: str | None = None,
    video_upload_parts: list[dict[str, Any]] | None = None,
    video_file_name: str | None = None,
    video_file_size: int | None = None,
) -> dict[str, Any]:
    object_id = _object_id(video_id, "Video")
    existing = await db.videos.find_one({"_id": object_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Video not found")

    references = await db.exercises.find(
        {
            "$or": [
                {"tutorial_video_id": video_id},
                {"short_clip_video_id": video_id},
            ]
        }
    ).to_list(length=None)
    mismatched = [
        item["exercise_id"]
        for item in references
        if item["exercise_id"] != exercise_id.strip()
    ]
    if mismatched:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Exercise ID doesn't match the exercise already associated "
                f"with this video ({mismatched[0]})"
            ),
        )

    changes: dict[str, Any] = {
        "exercise_id": exercise_id.strip(),
        "video_name": video_name.strip(),
        "video_description": video_description.strip(),
        "updated_at": datetime.now(timezone.utc),
    }
    old_keys: list[str | None] = []
    new_keys: list[str] = []

    try:
        if thumbnail:
            url, key = await run_in_threadpool(
                upload_file,
                thumbnail.file,
                thumbnail.filename,
                thumbnail.content_type,
                "thumbnails",
            )
            changes.update({"thumbnail_url": url, "thumbnail_key": key})
            old_keys.append(existing.get("thumbnail_key"))
            new_keys.append(key)

        if video_file:
            url, key = await run_in_threadpool(
                upload_file,
                video_file.file,
                video_file.filename,
                video_file.content_type,
                "videos",
            )
            changes.update(
                {
                    "video_url": url,
                    "video_key": key,
                    "video_file_name": video_file.filename,
                    "video_file_size": video_file.size,
                }
            )
            old_keys.append(existing.get("video_key"))
            new_keys.append(key)
        elif video_upload_key and video_upload_id and video_upload_parts:
            url, key = await run_in_threadpool(
                complete_multipart_upload,
                video_upload_key,
                video_upload_id,
                video_upload_parts,
            )
            changes.update(
                {
                    "video_url": url,
                    "video_key": key,
                    "video_file_name": video_file_name,
                    "video_file_size": video_file_size,
                }
            )
            old_keys.append(existing.get("video_key"))
            new_keys.append(key)

        await db.videos.update_one({"_id": object_id}, {"$set": changes})
    except Exception:
        for key in new_keys:
            await run_in_threadpool(delete_file, key)
        raise

    for key in old_keys:
        await run_in_threadpool(delete_file, key)
    updated = await db.videos.find_one({"_id": object_id})
    return serialize_video(updated)


async def delete_video(video_id: str) -> None:
    object_id = _object_id(video_id, "Video")
    referenced = await db.exercises.find_one(
        {
            "$or": [
                {"tutorial_video_id": video_id},
                {"short_clip_video_id": video_id},
            ]
        }
    )
    if referenced:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Video cannot be deleted while it is attached to an exercise",
        )
    video = await db.videos.find_one_and_delete({"_id": object_id})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    await run_in_threadpool(delete_file, video.get("thumbnail_key"))
    await run_in_threadpool(delete_file, video.get("video_key"))


async def _validated_video(video_id: str, exercise_id: str, label: str) -> dict[str, Any]:
    video = await db.videos.find_one({"_id": _object_id(video_id, label)})
    if not video:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    if video["exercise_id"] != exercise_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Exercise ID doesn't match: {label} belongs to "
                f"{video['exercise_id']}, not {exercise_id}"
            ),
        )
    return video


async def _exercise_document(
    payload: ExerciseCreate | ExerciseUpdate,
    created_at: datetime | None = None,
) -> dict[str, Any]:
    await _validated_video(
        payload.tutorial_video_id, payload.exercise_id, "Tutorial video"
    )
    await _validated_video(
        payload.short_clip_video_id, payload.exercise_id, "Short clip video"
    )
    now = datetime.now(timezone.utc)
    document = payload.model_dump(mode="json")
    document["updated_at"] = now
    if created_at is not None:
        document["created_at"] = created_at
    return document


async def create_exercise(payload: ExerciseCreate) -> ExerciseResponse:
    document = await _exercise_document(payload, datetime.now(timezone.utc))
    try:
        result = await db.exercises.insert_one(document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An exercise with this Exercise ID already exists",
        ) from None
    document["_id"] = result.inserted_id
    return ExerciseResponse(**(await serialize_exercise(document)))


async def update_exercise(exercise_id: str, payload: ExerciseUpdate) -> ExerciseResponse:
    existing = await db.exercises.find_one({"exercise_id": exercise_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Exercise not found")
    if payload.exercise_id != exercise_id:
        referenced = await db.plans.find_one(
            {
                "$or": [
                    {"phases.reset.exercise_id": exercise_id},
                    {"phases.control.exercise_id": exercise_id},
                    {"phases.integrate.exercise_id": exercise_id},
                ]
            }
        )
        if referenced:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Exercise ID cannot be changed while the exercise is in a plan",
            )
    document = await _exercise_document(payload)
    try:
        await db.exercises.update_one({"_id": existing["_id"]}, {"$set": document})
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An exercise with this Exercise ID already exists",
        ) from None
    updated = await db.exercises.find_one({"_id": existing["_id"]})
    return ExerciseResponse(**(await serialize_exercise(updated)))


async def delete_exercise(exercise_id: str) -> None:
    referenced = await db.plans.find_one(
        {
            "$or": [
                {"phases.reset.exercise_id": exercise_id},
                {"phases.control.exercise_id": exercise_id},
                {"phases.integrate.exercise_id": exercise_id},
            ]
        }
    )
    if referenced:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Exercise cannot be deleted while it is included in a plan",
        )
    result = await db.exercises.delete_one({"exercise_id": exercise_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found")


async def _plan_document(
    payload: PlanCreate | PlanUpdate,
    created_at: datetime | None = None,
) -> dict[str, Any]:
    phase_payload = payload.phases.model_dump(mode="json")
    requested_ids = {
        item["exercise_id"]
        for items in phase_payload.values()
        for item in items
    }
    exercises = {
        item["exercise_id"]: item
        async for item in db.exercises.find({"exercise_id": {"$in": list(requested_ids)}})
    }
    missing = sorted(requested_ids - exercises.keys())
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Exercises not found: {', '.join(missing)}",
        )

    phases: dict[str, list[dict[str, Any]]] = {}
    for phase_name, selections in phase_payload.items():
        phase_items = []
        for selection in selections:
            exercise = exercises[selection["exercise_id"]]
            if exercise["phase"] != phase_name:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        f"{exercise['exercise_name']} belongs to the "
                        f"{exercise['phase']} phase, not {phase_name}"
                    ),
                )
            phase_items.append(
                {
                    "exercise_id": exercise["exercise_id"],
                }
            )
        phases[phase_name] = phase_items

    now = datetime.now(timezone.utc)
    document = {
        "plan_id": payload.plan_id,
        "plan_name": payload.plan_name,
        "target_area": payload.target_area.value,
        "use_case": payload.use_case.value,
        "duration": payload.duration,
        "phases": phases,
        "status": payload.status.value,
        "updated_at": now,
    }
    if created_at is not None:
        document["created_at"] = created_at
    return document


async def create_plan(payload: PlanCreate) -> PlanResponse:
    document = await _plan_document(payload, datetime.now(timezone.utc))
    try:
        result = await db.plans.insert_one(document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A plan with this Plan ID already exists",
        ) from None
    document["_id"] = result.inserted_id
    return PlanResponse(**await serialize_plan(document))


async def update_plan(plan_id: str, payload: PlanUpdate) -> PlanResponse:
    existing = await db.plans.find_one({"plan_id": plan_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Plan not found")
    document = await _plan_document(payload)
    try:
        await db.plans.update_one({"_id": existing["_id"]}, {"$set": document})
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A plan with this Plan ID already exists",
        ) from None
    updated = await db.plans.find_one({"_id": existing["_id"]})
    return PlanResponse(**await serialize_plan(updated))


async def delete_plan(plan_id: str) -> None:
    result = await db.plans.delete_one({"plan_id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
