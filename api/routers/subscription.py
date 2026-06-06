from fastapi import APIRouter, Depends

from core.dependencies import get_current_user
from schemas.subscription import SubscriptionStatusResponse
from services.subscription_service import (
    refresh_user_subscription_from_revenuecat,
    serialize_subscription,
)

router = APIRouter(prefix="/subscription", tags=["Subscription"])


@router.get("/me", response_model=SubscriptionStatusResponse)
async def get_my_subscription(
    current_user: dict = Depends(get_current_user),
) -> SubscriptionStatusResponse:
    return SubscriptionStatusResponse(**serialize_subscription(current_user))


@router.post("/sync", response_model=SubscriptionStatusResponse)
async def sync_my_subscription(
    current_user: dict = Depends(get_current_user),
) -> SubscriptionStatusResponse:
    subscription = await refresh_user_subscription_from_revenuecat(current_user)
    return SubscriptionStatusResponse(**subscription)
