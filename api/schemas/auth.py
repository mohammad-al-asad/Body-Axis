from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class OtpPurpose(str, Enum):
    email_verify = "email_verify"
    forgot_password = "forgot_password"


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)
    gender: str
    date_of_birth: date

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str) -> str:
        if value is None or value == "":
            raise ValueError("gender is required")

        normalized = str(value).strip().lower().replace(" ", "_")
        allowed = {"male", "female", "other"}
        if normalized not in allowed:
            raise ValueError("gender must be male, female, or other")
        return normalized

    @model_validator(mode="after")
    def validate_passwords(self) -> "SignupRequest":
        if self.password != self.confirm_password:
            raise ValueError("password and confirm_password must match")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128) 
    

class OtpRequest(BaseModel):
    email: EmailStr
    purpose: OtpPurpose


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    purpose: OtpPurpose
    otp_code: str = Field(min_length=4, max_length=8)
    new_password: str | None = Field(default=None, min_length=8, max_length=128)
    confirm_new_password: str | None = Field(default=None, min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_new_passwords(self) -> "OtpVerifyRequest":
        if self.new_password or self.confirm_new_password:
            if self.new_password != self.confirm_new_password:
                raise ValueError("new_password and confirm_new_password must match")
        return self


class GoogleSignInRequest(BaseModel):
    id_token: str = Field(min_length=1)


class AppleSignInRequest(BaseModel):
    identity_token: str = Field(min_length=1)
    full_name: str | None = Field(default=None, max_length=100)


class UserResponse(BaseModel):
    id: str
    full_name: str | None = None
    email: EmailStr
    gender: str | None = None
    date_of_birth: date | None = None
    height_cm: int | None = None
    weight_kg: int | None = None
    email_verified: bool
    auth_provider: str
    is_intake_completed: bool = False
    created_at: datetime


class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    dev_otp: str | None = None


class OtpResponse(BaseModel):
    message: str
    dev_otp: str | None = None


class OtpVerifyResponse(BaseModel):
    message: str
    verified: bool = True
