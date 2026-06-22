from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from core.config import settings
from core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from database import db
from schemas.admin import (
    AdminAuthResponse,
    AdminLoginRequest,
    AdminPasswordUpdateRequest,
    AdminResponse,
    AdminUpdateRequest,
)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def serialize_admin(admin: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(admin["_id"]),
        "name": admin["name"],
        "email": admin["email"],
        "notification_settings": admin.get(
            "notification_settings",
            {
                "user_alerts": True,
                "subscription_alerts": True,
            },
        ),
        "two_factor_authentication": bool(
            admin.get("two_factor_authentication", False)
        ),
        "active": bool(admin.get("active", True)),
        "last_login_at": admin.get("last_login_at"),
        "created_at": admin["created_at"],
        "updated_at": admin["updated_at"],
    }


async def ensure_admin_indexes() -> None:
    await db.admins.create_index("email", unique=True)

    # Bootstrap is only for the very first administrator. Once any admin
    # exists, profile email changes must not create a second bootstrap admin.
    if await db.admins.find_one({}, {"_id": 1}):
        return

    email = settings.admin_bootstrap_email
    password = settings.admin_bootstrap_password
    if not email and not password:
        return
    if not email or not password:
        raise RuntimeError(
            "ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set together"
        )
    if len(password) < 8:
        raise RuntimeError("ADMIN_BOOTSTRAP_PASSWORD must contain at least 8 characters")

    normalized_email = _normalize_email(email)
    now = datetime.now(timezone.utc)
    await db.admins.insert_one(
        {
            "name": (settings.admin_bootstrap_name or "Body Axis Admin").strip(),
            "email": normalized_email,
            "password_hash": hash_password(password),
            "notification_settings": {
                "user_alerts": True,
                "subscription_alerts": True,
            },
            "two_factor_authentication": False,
            "active": True,
            "last_login_at": None,
            "created_at": now,
            "updated_at": now,
        }
    )


async def login_admin(payload: AdminLoginRequest) -> AdminAuthResponse:
    admin = await db.admins.find_one(
        {"email": _normalize_email(payload.email), "active": True}
    )
    if not admin or not verify_password(payload.password, admin.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin email or password",
        )

    now = datetime.now(timezone.utc)
    await db.admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login_at": now, "updated_at": now}},
    )
    admin["last_login_at"] = now
    admin["updated_at"] = now
    return AdminAuthResponse(
        message="Admin login successful",
        access_token=create_access_token(
            str(admin["_id"]),
            admin["email"],
            subject_type="admin",
        ),
        admin=AdminResponse(**serialize_admin(admin)),
    )


async def update_admin(
    current_admin: dict[str, Any],
    payload: AdminUpdateRequest,
) -> AdminResponse:
    now = datetime.now(timezone.utc)
    changes = {
        "name": payload.name,
        "email": _normalize_email(payload.email),
        "notification_settings": payload.notification_settings.model_dump(),
        "two_factor_authentication": payload.two_factor_authentication,
        "updated_at": now,
    }
    try:
        await db.admins.update_one(
            {"_id": current_admin["_id"]},
            {"$set": changes},
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An admin with this email already exists",
        ) from None

    updated = await db.admins.find_one({"_id": current_admin["_id"]})
    return AdminResponse(**serialize_admin(updated))


async def update_admin_password(
    current_admin: dict[str, Any],
    payload: AdminPasswordUpdateRequest,
) -> None:
    if not verify_password(
        payload.current_password,
        current_admin.get("password_hash"),
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be different from the current password",
        )

    await db.admins.update_one(
        {"_id": current_admin["_id"]},
        {
            "$set": {
                "password_hash": hash_password(payload.new_password),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
