from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, File, Query, Response, UploadFile, status

from core.dependencies import get_current_admin
from schemas.admin import (
    AdminAuthResponse,
    AdminLoginRequest,
    AdminPasswordUpdateRequest,
    AdminResponse,
    AdminUpdateRequest,
)
from schemas.admin_users import AdminUserListResponse
from schemas.dashboard import DashboardAnalyticsResponse
from schemas.subscription_admin import (
    EntitlementActionResponse,
    GrantEntitlementRequest,
    RevokeEntitlementRequest,
    SubscriptionAnalyticsResponse,
)
from services.admin_service import (
    login_admin,
    serialize_admin,
    update_admin,
    update_admin_avatar,
    update_admin_password,
)
from services.admin_user_service import get_admin_users
from services.dashboard_service import get_dashboard_analytics
from services.subscription_admin_service import (
    get_subscription_analytics,
    grant_customer_entitlement,
    revoke_customer_entitlement,
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


@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard(
    granularity: Literal["daily", "weekly", "monthly"] = "daily",
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=13)),
    end_date: date = Query(default_factory=date.today),
    current_admin: dict = Depends(get_current_admin),
) -> DashboardAnalyticsResponse:
    del current_admin
    if start_date > end_date:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date must be before or equal to end_date",
        )
    return await get_dashboard_analytics(granularity, start_date, end_date)


@router.get(
    "/subscriptions",
    response_model=SubscriptionAnalyticsResponse,
)
async def get_admin_subscriptions(
    current_admin: dict = Depends(get_current_admin),
) -> SubscriptionAnalyticsResponse:
    del current_admin
    return await get_subscription_analytics()


@router.get("/users", response_model=AdminUserListResponse)
async def get_users_for_admin(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=120),
    global_search: str | None = Query(default=None, max_length=120),
    start_date: date | None = None,
    end_date: date | None = None,
    status_filter: str | None = Query(default=None, alias="status", max_length=30),
    current_admin: dict = Depends(get_current_admin),
) -> AdminUserListResponse:
    del current_admin
    if start_date and end_date and start_date > end_date:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date must be before or equal to end_date",
        )
    return await get_admin_users(
        page=page,
        page_size=page_size,
        search=search,
        global_search=global_search,
        start_date=start_date,
        end_date=end_date,
        status=status_filter,
    )


@router.post(
    "/subscriptions/entitlements/grant",
    response_model=EntitlementActionResponse,
)
async def grant_admin_customer_entitlement(
    payload: GrantEntitlementRequest,
    current_admin: dict = Depends(get_current_admin),
) -> EntitlementActionResponse:
    return await grant_customer_entitlement(
        payload,
        str(current_admin["_id"]),
    )


@router.post(
    "/subscriptions/entitlements/revoke",
    response_model=EntitlementActionResponse,
)
async def revoke_admin_customer_entitlement(
    payload: RevokeEntitlementRequest,
    current_admin: dict = Depends(get_current_admin),
) -> EntitlementActionResponse:
    return await revoke_customer_entitlement(
        payload,
        str(current_admin["_id"]),
    )


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


@router.put("/avatar", response_model=AdminResponse)
async def update_avatar(
    avatar: UploadFile = File(),
    current_admin: dict = Depends(get_current_admin),
) -> AdminResponse:
    return await update_admin_avatar(current_admin, avatar)
