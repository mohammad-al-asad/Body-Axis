from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from pymongo.errors import DuplicateKeyError

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
from schemas.auth import (
    AppleSignInRequest,
    AuthResponse,
    GoogleSignInRequest,
    LoginRequest,
    OtpPurpose,
    OtpRequest,
    OtpResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    SignupRequest,
)

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"


async def ensure_auth_indexes() -> None:
    await db.users.create_index("email", unique=True)
    await db.users.create_index("social_accounts.google.subject", sparse=True)
    await db.users.create_index("social_accounts.apple.subject", sparse=True)
    await db.otps.create_index("expires_at", expireAfterSeconds=0)
    await db.otps.create_index([("email", 1), ("purpose", 1), ("used_at", 1)])


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _serialize_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name"),
        "email": user["email"],
        "gender": user.get("gender"),
        "date_of_birth": user.get("date_of_birth"),
        "email_verified": bool(user.get("email_verified", False)),
        "auth_provider": user.get("auth_provider", "password"),
        "is_intake_completed": bool(user.get("is_intake_completed", False)),
        "created_at": user["created_at"],
    }


def _auth_response(
    user: dict[str, Any],
    message: str,
    dev_otp: str | None = None,
) -> AuthResponse:
    return AuthResponse(
        message=message,
        access_token=create_access_token(str(user["_id"]), user["email"]),
        user=_serialize_user(user),
        dev_otp=dev_otp if settings.return_dev_otp else None,
    )


async def _create_otp(email: str, purpose: OtpPurpose) -> str:
    normalized_email = _normalize_email(email)
    otp_code = generate_otp()
    now = datetime.now(timezone.utc)

    await db.otps.delete_many(
        {
            "email": normalized_email,
            "purpose": purpose.value,
            "used_at": None,
        }
    )

    await db.otps.insert_one(
        {
            "email": normalized_email,
            "purpose": purpose.value,
            "otp_hash": hash_otp(normalized_email, purpose.value, otp_code),
            "attempts": 0,
            "used_at": None,
            "created_at": now,
            "expires_at": now + timedelta(minutes=settings.otp_expire_minutes),
        }
    )
    return otp_code


async def signup(payload: SignupRequest) -> AuthResponse:
    now = datetime.now(timezone.utc)
    email = _normalize_email(payload.email)
    user = {
        "full_name": payload.full_name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "gender": payload.gender,
        "date_of_birth": payload.date_of_birth.isoformat(),
        "email_verified": False,
        "auth_provider": "password",
        "social_accounts": {},
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from None

    user["_id"] = result.inserted_id
    dev_otp = await _create_otp(email, OtpPurpose.email_verify)
    return _auth_response(user, "Signup successful. Verify your email with the OTP.", dev_otp)


async def login(payload: LoginRequest) -> AuthResponse:
    email = _normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(payload.password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login_at": datetime.now(timezone.utc)}},
    )
    return _auth_response(user, "Login successful")


async def request_otp(payload: OtpRequest) -> OtpResponse:
    email = _normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user:
        return OtpResponse(message="If the account exists, an OTP has been sent.")

    dev_otp = await _create_otp(email, payload.purpose)
    return OtpResponse(
        message="OTP created. Send this code by email in production.",
        dev_otp=dev_otp if settings.return_dev_otp else None,
    )


async def verify_otp(payload: OtpVerifyRequest) -> OtpVerifyResponse:
    email = _normalize_email(payload.email)
    now = datetime.now(timezone.utc)

    otp_record = await db.otps.find_one(
        {
            "email": email,
            "purpose": payload.purpose.value,
            "used_at": None,
            "expires_at": {"$gt": now},
        },
        sort=[("created_at", -1)],
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP is invalid or expired",
        )

    if otp_record.get("attempts", 0) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP attempts. Request a new code.",
        )

    if not verify_otp_hash(
        email,
        payload.purpose.value,
        payload.otp_code,
        otp_record["otp_hash"],
    ):
        await db.otps.update_one(
            {"_id": otp_record["_id"]},
            {"$inc": {"attempts": 1}},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP is invalid or expired",
        )

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_data: dict[str, Any] = {
        "updated_at": now,
    }
    message = "OTP verified"

    if payload.purpose == OtpPurpose.email_verify:
        update_data["email_verified"] = True
        message = "Email verified successfully"

    if payload.purpose == OtpPurpose.forgot_password:
        if not payload.new_password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="new_password is required for forgot_password OTP verification",
            )
        update_data["password_hash"] = hash_password(payload.new_password)
        message = "Password reset successfully"

    await db.users.update_one({"_id": user["_id"]}, {"$set": update_data})
    await db.otps.update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"used_at": now}},
    )

    return OtpVerifyResponse(message=message)


def _decode_provider_token(
    token: str,
    jwks_url: str,
    audience: str | None,
    provider: str,
) -> dict[str, Any]:
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{provider.upper()}_CLIENT_ID is not configured",
        )

    try:
        signing_key = PyJWKClient(jwks_url).get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            options={"verify_iss": False},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid {provider} identity token",
        ) from exc

    if provider == "google":
        valid_issuers = {"accounts.google.com", "https://accounts.google.com"}
    else:
        valid_issuers = {"https://appleid.apple.com"}

    if payload.get("iss") not in valid_issuers:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid {provider} token issuer",
        )

    return payload


async def _social_sign_in(
    provider: str,
    subject: str,
    email: str | None,
    full_name: str | None,
    email_verified: bool,
) -> AuthResponse:
    now = datetime.now(timezone.utc)
    account_path = f"social_accounts.{provider}"

    user = await db.users.find_one({f"{account_path}.subject": subject})
    if not user and email:
        user = await db.users.find_one({"email": _normalize_email(email)})

    if user:
        update_data = {
            f"{account_path}.subject": subject,
            f"{account_path}.email": _normalize_email(email) if email else user["email"],
            f"{account_path}.linked_at": now,
            "last_login_at": now,
            "updated_at": now,
        }
        if email_verified:
            update_data["email_verified"] = True
        if full_name and not user.get("full_name"):
            update_data["full_name"] = full_name

        await db.users.update_one({"_id": user["_id"]}, {"$set": update_data})
        updated_user = await db.users.find_one({"_id": user["_id"]})
        return _auth_response(updated_user, f"{provider.title()} sign-in successful")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{provider.title()} did not return an email for this account",
        )

    new_user = {
        "full_name": full_name,
        "email": _normalize_email(email),
        "password_hash": None,
        "gender": None,
        "date_of_birth": None,
        "email_verified": email_verified,
        "auth_provider": provider,
        "social_accounts": {
            provider: {
                "subject": subject,
                "email": _normalize_email(email),
                "linked_at": now,
            }
        },
        "created_at": now,
        "updated_at": now,
        "last_login_at": now,
    }

    try:
        result = await db.users.insert_one(new_user)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from None

    new_user["_id"] = result.inserted_id
    return _auth_response(new_user, f"{provider.title()} sign-in successful")


async def google_sign_in(payload: GoogleSignInRequest) -> AuthResponse:
    token_payload = _decode_provider_token(
        payload.id_token,
        GOOGLE_JWKS_URL,
        settings.google_client_id,
        "google",
    )

    email = token_payload.get("email")
    return await _social_sign_in(
        provider="google",
        subject=token_payload["sub"],
        email=email,
        full_name=token_payload.get("name"),
        email_verified=bool(token_payload.get("email_verified", False)),
    )


async def apple_sign_in(payload: AppleSignInRequest) -> AuthResponse:
    token_payload = _decode_provider_token(
        payload.identity_token,
        APPLE_JWKS_URL,
        settings.apple_client_id,
        "apple",
    )

    email_verified = token_payload.get("email_verified")
    return await _social_sign_in(
        provider="apple",
        subject=token_payload["sub"],
        email=token_payload.get("email"),
        full_name=payload.full_name,
        email_verified=email_verified is True or email_verified == "true",
    )
