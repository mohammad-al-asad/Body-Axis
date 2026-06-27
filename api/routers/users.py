from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, status, File, UploadFile
from pydantic import BaseModel, EmailStr, Field, model_validator
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool

from core.dependencies import get_current_user
from core.security import hash_password, verify_password
from database import db
from schemas.auth import UserResponse
from services.auth_service import _normalize_email, _serialize_user
from services.s3_service import upload_file, delete_file

router = APIRouter(prefix="/users", tags=["Users"])


class IntakeRequest(BaseModel):
    pain_points: list[str]
    primary_goal: str
    schedule_days: int
    schedule_weeks: int
    session_duration: int


class UserProfileUpdateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr | None = None
    gender: str = Field(max_length=20)
    date_of_birth: date
    height_cm: int | None = Field(default=None, ge=50, le=300)
    weight_kg: int | None = Field(default=None, ge=10, le=500)


class UserPasswordUpdateRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
    confirm_new_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> "UserPasswordUpdateRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("new_password and confirm_new_password must match")
        return self


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


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    payload: UserProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    gender = payload.gender.strip().lower()
    if gender not in {"male", "female", "other"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="gender must be male, female, or other",
        )

    update_data = {
        "full_name": " ".join(payload.full_name.strip().split()),
        "gender": gender,
        "date_of_birth": payload.date_of_birth.isoformat(),
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
        "updated_at": datetime.now(timezone.utc),
    }

    if payload.email:
        update_data["email"] = _normalize_email(str(payload.email))

    try:
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already in use",
        ) from None
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**_serialize_user(updated_user))


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_my_password(
    payload: UserPasswordUpdateRequest,
    current_user: dict = Depends(get_current_user),
) -> Response:
    if not current_user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password changes are only available for password-based accounts",
        )
    if not verify_password(payload.current_password, current_user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "password_hash": hash_password(payload.new_password),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    current_user: dict = Depends(get_current_user),
) -> Response:
    user_id = str(current_user["_id"])
    await db.sessions.delete_many({"user_id": user_id})
    await db.users.delete_one({"_id": current_user["_id"]})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/me/avatar", response_model=UserResponse)
async def update_my_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image",
        )

    # Upload new file to S3
    avatar_url, avatar_key = await run_in_threadpool(
        upload_file,
        file.file,
        file.filename,
        file.content_type,
        "avatars",
    )

    # Delete old avatar from S3 if it exists
    old_key = current_user.get("avatar_key")
    if old_key:
        await run_in_threadpool(delete_file, old_key)

    # Update in database
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "avatar_url": avatar_url,
                "avatar_key": avatar_key,
                "updated_at": now,
            }
        },
    )

    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**_serialize_user(updated_user))


@router.delete("/me/avatar", response_model=UserResponse)
async def delete_my_avatar(
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    # Delete avatar from S3
    old_key = current_user.get("avatar_key")
    if old_key:
        await run_in_threadpool(delete_file, old_key)

    # Reset in database
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "avatar_url": None,
                "avatar_key": None,
                "updated_at": now,
            }
        },
    )

    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**_serialize_user(updated_user))
