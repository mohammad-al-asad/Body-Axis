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
