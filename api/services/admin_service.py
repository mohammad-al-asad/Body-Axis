import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, UploadFile, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool

from core.config import settings
from core.security import (
    create_access_token,
    generate_otp,
    hash_otp,
    hash_password,
    verify_otp_hash,
    verify_password,
)
from database import db
from schemas.admin import (
    AdminAuthResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    AdminPasswordUpdateRequest,
    AdminResponse,
    AdminTwoFactorChallengeResponse,
    AdminTwoFactorVerifyRequest,
    AdminUpdateRequest,
)
from services.email_service import send_otp_email
from services.s3_service import delete_file, upload_file

ADMIN_AVATAR_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp"}
ADMIN_2FA_LOGIN_PURPOSE = "admin_login_2fa"
ADMIN_2FA_SETUP_PURPOSE = "admin_setup_2fa"
ADMIN_2FA_DISABLE_PURPOSE = "admin_disable_2fa"


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def serialize_admin(admin: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(admin["_id"]),
        "name": admin["name"],
        "email": admin["email"],
        "avatar_url": admin.get("avatar_url"),
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


def _admin_auth_response(admin: dict[str, Any], message: str) -> AdminAuthResponse:
    return AdminAuthResponse(
        message=message,
        access_token=create_access_token(
            str(admin["_id"]),
            admin["email"],
            subject_type="admin",
        ),
        admin=AdminResponse(**serialize_admin(admin)),
    )


async def ensure_admin_indexes() -> None:
    await db.admins.create_index("email", unique=True)
    await db.admin_2fa_codes.create_index("expires_at", expireAfterSeconds=0)
    await db.admin_2fa_codes.create_index("challenge_id", unique=True)
    await db.admin_2fa_codes.create_index(
        [("admin_id", 1), ("purpose", 1), ("used_at", 1)]
    )

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
            "avatar_url": None,
            "avatar_key": None,
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


async def _create_admin_2fa_challenge(
    admin: dict[str, Any],
    purpose: str,
) -> AdminTwoFactorChallengeResponse:
    admin_id = str(admin["_id"])
    email = admin["email"]
    challenge_id = secrets.token_urlsafe(32)
    otp_code = generate_otp()
    now = datetime.now(timezone.utc)

    await db.admin_2fa_codes.delete_many(
        {
            "admin_id": admin_id,
            "purpose": purpose,
            "used_at": None,
        }
    )
    await db.admin_2fa_codes.insert_one(
        {
            "admin_id": admin_id,
            "email": email,
            "purpose": purpose,
            "challenge_id": challenge_id,
            "otp_hash": hash_otp(email, purpose, otp_code),
            "attempts": 0,
            "used_at": None,
            "created_at": now,
            "expires_at": now + timedelta(minutes=settings.otp_expire_minutes),
        }
    )

    try:
        await send_otp_email(email, otp_code, purpose)
    except Exception:
        await db.admin_2fa_codes.delete_one({"challenge_id": challenge_id})
        raise

    return AdminTwoFactorChallengeResponse(
        message="Verification code sent to your email.",
        challenge_id=challenge_id,
    )


async def _verify_admin_2fa_challenge(
    payload: AdminTwoFactorVerifyRequest,
    purpose: str,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    challenge = await db.admin_2fa_codes.find_one(
        {
            "challenge_id": payload.challenge_id,
            "purpose": purpose,
            "used_at": None,
            "expires_at": {"$gt": now},
        }
    )
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or expired",
        )
    if challenge.get("attempts", 0) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts. Request a new code.",
        )

    if not verify_otp_hash(
        challenge["email"],
        purpose,
        payload.otp_code,
        challenge["otp_hash"],
    ):
        await db.admin_2fa_codes.update_one(
            {"_id": challenge["_id"]},
            {"$inc": {"attempts": 1}},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or expired",
        )

    try:
        admin_object_id = ObjectId(challenge["admin_id"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or expired",
        ) from None

    admin = await db.admins.find_one({"_id": admin_object_id, "active": True})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or expired",
        )

    await db.admin_2fa_codes.update_one(
        {"_id": challenge["_id"]},
        {"$set": {"used_at": now}},
    )
    return admin


async def login_admin(payload: AdminLoginRequest) -> AdminLoginResponse:
    admin = await db.admins.find_one(
        {"email": _normalize_email(payload.email), "active": True}
    )
    if not admin or not verify_password(payload.password, admin.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin email or password",
        )

    if admin.get("two_factor_authentication", False):
        challenge = await _create_admin_2fa_challenge(admin, ADMIN_2FA_LOGIN_PURPOSE)
        return AdminLoginResponse(
            message=challenge.message,
            requires_2fa=True,
            challenge_id=challenge.challenge_id,
        )

    now = datetime.now(timezone.utc)
    await db.admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login_at": now, "updated_at": now}},
    )
    admin["last_login_at"] = now
    admin["updated_at"] = now
    auth_response = _admin_auth_response(admin, "Admin login successful")
    return AdminLoginResponse(
        message=auth_response.message,
        requires_2fa=False,
        access_token=auth_response.access_token,
        token_type=auth_response.token_type,
        admin=auth_response.admin,
    )


async def verify_admin_login_2fa(
    payload: AdminTwoFactorVerifyRequest,
) -> AdminAuthResponse:
    admin = await _verify_admin_2fa_challenge(payload, ADMIN_2FA_LOGIN_PURPOSE)
    now = datetime.now(timezone.utc)
    await db.admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login_at": now, "updated_at": now}},
    )
    admin["last_login_at"] = now
    admin["updated_at"] = now
    return _admin_auth_response(admin, "Admin login successful")


async def request_admin_2fa_setup(
    current_admin: dict[str, Any],
) -> AdminTwoFactorChallengeResponse:
    if current_admin.get("two_factor_authentication", False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Two-factor authentication is already enabled",
        )
    return await _create_admin_2fa_challenge(
        current_admin,
        ADMIN_2FA_SETUP_PURPOSE,
    )


async def verify_admin_2fa_setup(
    current_admin: dict[str, Any],
    payload: AdminTwoFactorVerifyRequest,
) -> AdminResponse:
    admin = await _verify_admin_2fa_challenge(payload, ADMIN_2FA_SETUP_PURPOSE)
    if admin["_id"] != current_admin["_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or expired",
        )

    await db.admins.update_one(
        {"_id": current_admin["_id"]},
        {
            "$set": {
                "two_factor_authentication": True,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    updated = await db.admins.find_one({"_id": current_admin["_id"]})
    return AdminResponse(**serialize_admin(updated))


async def request_admin_2fa_disable(
    current_admin: dict[str, Any],
) -> AdminTwoFactorChallengeResponse:
    if not current_admin.get("two_factor_authentication", False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Two-factor authentication is already disabled",
        )
    return await _create_admin_2fa_challenge(
        current_admin,
        ADMIN_2FA_DISABLE_PURPOSE,
    )


async def verify_admin_2fa_disable(
    current_admin: dict[str, Any],
    payload: AdminTwoFactorVerifyRequest,
) -> AdminResponse:
    admin = await _verify_admin_2fa_challenge(payload, ADMIN_2FA_DISABLE_PURPOSE)
    if admin["_id"] != current_admin["_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or expired",
        )

    await db.admins.update_one(
        {"_id": current_admin["_id"]},
        {
            "$set": {
                "two_factor_authentication": False,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    updated = await db.admins.find_one({"_id": current_admin["_id"]})
    return AdminResponse(**serialize_admin(updated))


async def update_admin(
    current_admin: dict[str, Any],
    payload: AdminUpdateRequest,
) -> AdminResponse:
    now = datetime.now(timezone.utc)
    changes = {
        "name": payload.name,
        "email": _normalize_email(payload.email),
        "notification_settings": payload.notification_settings.model_dump(),
        "updated_at": now,
    }
    if payload.two_factor_authentication != bool(
        current_admin.get("two_factor_authentication", False)
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Use the two-factor verification endpoints to change two-factor authentication",
        )
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


async def update_admin_avatar(
    current_admin: dict[str, Any],
    avatar: UploadFile,
) -> AdminResponse:
    if avatar.content_type not in ADMIN_AVATAR_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Avatar must be a PNG, JPG, or WEBP image",
        )
    avatar_url, avatar_key = await run_in_threadpool(
        upload_file,
        avatar.file,
        avatar.filename,
        avatar.content_type,
        "admin-avatars",
    )
    previous_key = current_admin.get("avatar_key")
    try:
        await db.admins.update_one(
            {"_id": current_admin["_id"]},
            {
                "$set": {
                    "avatar_url": avatar_url,
                    "avatar_key": avatar_key,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
    except Exception:
        await run_in_threadpool(delete_file, avatar_key)
        raise

    await run_in_threadpool(delete_file, previous_key)
    updated = await db.admins.find_one({"_id": current_admin["_id"]})
    return AdminResponse(**serialize_admin(updated))
