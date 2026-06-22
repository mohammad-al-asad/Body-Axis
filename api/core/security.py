import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

from core.config import settings

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False

    try:
        return password_hash.verify(password, stored_hash)
    except UnknownHashError:
        return False


def create_access_token(
    user_id: str,
    email: str,
    subject_type: str = "user",
) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "type": subject_type,
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
