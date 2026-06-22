from fastapi import APIRouter, HTTPException, Query, Response, status

from database import db
from schemas.management import (
    ExerciseCreate,
    ExerciseListResponse,
    ExerciseResponse,
    ExerciseUpdate,
    Phase,
)
from services.management_service import (
    create_exercise,
    delete_exercise,
    serialize_exercise,
    update_exercise,
)

router = APIRouter(prefix="/exercises", tags=["Exercise Management"])


@router.post("", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise_item(payload: ExerciseCreate) -> ExerciseResponse:
    return await create_exercise(payload)


@router.get("", response_model=ExerciseListResponse)
async def get_exercise_list(
    search: str = Query(default="", max_length=160),
    phase: Phase | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
) -> ExerciseListResponse:
    query = {}
    if search:
        query["$or"] = [
            {"exercise_name": {"$regex": search, "$options": "i"}},
            {"exercise_id": {"$regex": search, "$options": "i"}},
        ]
    if phase:
        query["phase"] = phase.value

    total = await db.exercises.count_documents(query)
    items = [
        await serialize_exercise(item)
        async for item in db.exercises.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    ]
    return ExerciseListResponse(items=items, total=total)


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(exercise_id: str) -> ExerciseResponse:
    item = await db.exercises.find_one({"exercise_id": exercise_id})
    if not item:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ExerciseResponse(**(await serialize_exercise(item)))


@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise_item(
    exercise_id: str, payload: ExerciseUpdate
) -> ExerciseResponse:
    return await update_exercise(exercise_id, payload)


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise_item(exercise_id: str) -> Response:
    await delete_exercise(exercise_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
