from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.dependencies import get_current_user
from database import db
from schemas.auth import UserResponse
from services.auth_service import _serialize_user

router = APIRouter(prefix="/users", tags=["Users"])


class IntakeRequest(BaseModel):
    pain_points: list[str]
    primary_goal: str
    schedule_days: int
    schedule_weeks: int
    session_duration: int


@router.post("/intake", response_model=UserResponse)
async def save_user_intake(
    payload: IntakeRequest,
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "is_intake_completed": True,
                "intake": {
                    "pain_points": payload.pain_points,
                    "primary_goal": payload.primary_goal,
                    "schedule_days": payload.schedule_days,
                    "schedule_weeks": payload.schedule_weeks,
                    "session_duration": payload.session_duration,
                    "completed_at": now,
                },
                "updated_at": now,
            }
        },
    )
    # Refresh current user dict to return serialized updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**_serialize_user(updated_user))


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    return UserResponse(**_serialize_user(current_user))
