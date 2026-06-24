from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class AdminNotificationSettings(BaseModel):
    user_alerts: bool = True
    subscription_alerts: bool = True


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AdminResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar_url: str | None = None
    notification_settings: AdminNotificationSettings
    two_factor_authentication: bool
    active: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class AdminAuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse


class AdminLoginResponse(BaseModel):
    message: str
    requires_2fa: bool = False
    challenge_id: str | None = None
    access_token: str | None = None
    token_type: str = "bearer"
    admin: AdminResponse | None = None


class AdminUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    notification_settings: AdminNotificationSettings
    two_factor_authentication: bool

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return " ".join(value.strip().split())


class AdminPasswordUpdateRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AdminTwoFactorChallengeResponse(BaseModel):
    message: str
    challenge_id: str


class AdminTwoFactorVerifyRequest(BaseModel):
    challenge_id: str = Field(min_length=16, max_length=160)
    otp_code: str = Field(min_length=4, max_length=8)
