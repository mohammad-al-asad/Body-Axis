import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from core.config import settings

PASSWORD_HASH_ITERATIONS = 600_000


def _b64_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _b64_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    return (
        f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}"
        f"${_b64_encode(salt)}${_b64_encode(password_hash)}"
    )


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False

    try:
        algorithm, iterations, salt, expected_hash = stored_hash.split("$")
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        _b64_decode(salt),
        int(iterations),
    )
    return hmac.compare_digest(_b64_encode(actual_hash), expected_hash)


def create_access_token(user_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": now,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def generate_otp() -> str:
    max_value = 10**settings.otp_length
    return str(secrets.randbelow(max_value)).zfill(settings.otp_length)


def hash_otp(email: str, purpose: str, otp_code: str) -> str:
    message = f"{email.lower()}:{purpose}:{otp_code}".encode()
    return hmac.new(settings.secret_key.encode(), message, hashlib.sha256).hexdigest()


def verify_otp_hash(email: str, purpose: str, otp_code: str, otp_hash: str) -> bool:
    return hmac.compare_digest(hash_otp(email, purpose, otp_code), otp_hash)
