from fastapi import APIRouter, Depends, Response, status

from core.dependencies import get_current_admin
from schemas.admin import (
    AdminAuthResponse,
    AdminLoginRequest,
    AdminPasswordUpdateRequest,
    AdminResponse,
    AdminUpdateRequest,
)
from services.admin_service import (
    login_admin,
    serialize_admin,
    update_admin,
    update_admin_password,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/auth/login", response_model=AdminAuthResponse)
async def admin_login(payload: AdminLoginRequest) -> AdminAuthResponse:
    return await login_admin(payload)


@router.get("/me", response_model=AdminResponse)
async def get_admin_profile(
    current_admin: dict = Depends(get_current_admin),
) -> AdminResponse:
    return AdminResponse(**serialize_admin(current_admin))


@router.put("/me", response_model=AdminResponse)
async def update_admin_profile(
    payload: AdminUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
) -> AdminResponse:
    return await update_admin(current_admin, payload)


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_admin_password(
    payload: AdminPasswordUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
) -> Response:
    await update_admin_password(current_admin, payload)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
