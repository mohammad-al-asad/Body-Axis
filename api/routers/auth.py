from fastapi import APIRouter, status

from schemas.auth import (
    AppleSignInRequest,
    AuthResponse,
    GoogleSignInRequest,
    LoginRequest,
    OtpRequest,
    OtpResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    SignupRequest,
)
from services.auth_service import (
    apple_sign_in,
    google_sign_in,
    login,
    request_otp,
    signup,
    verify_otp,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup_user(payload: SignupRequest) -> AuthResponse:
    return await signup(payload)


@router.post("/login", response_model=AuthResponse)
async def login_user(payload: LoginRequest) -> AuthResponse:
    return await login(payload)


@router.post("/otp/request", response_model=OtpResponse)
async def create_otp(payload: OtpRequest) -> OtpResponse:
    return await request_otp(payload)


@router.post("/otp/verify", response_model=OtpVerifyResponse)
async def verify_otp_code(payload: OtpVerifyRequest) -> OtpVerifyResponse:
    return await verify_otp(payload)


@router.post("/google", response_model=AuthResponse)
async def sign_in_with_google(payload: GoogleSignInRequest) -> AuthResponse:
    return await google_sign_in(payload)


@router.post("/apple", response_model=AuthResponse)
async def sign_in_with_apple(payload: AppleSignInRequest) -> AuthResponse:
    return await apple_sign_in(payload)
