from fastapi import APIRouter, Header, HTTPException, Request, status

from core.config import settings
from schemas.subscription import RevenueCatWebhookResponse
from services.subscription_service import process_revenuecat_webhook

router = APIRouter(prefix="/revenuecat", tags=["RevenueCat"])


def _valid_webhook_authorization_values() -> set[str]:
    configured = settings.revenuecat_webhook_auth
    if not configured:
        return set()

    values = {configured}
    if not configured.lower().startswith("bearer "):
        values.add(f"Bearer {configured}")

    return values


@router.post("/webhook", response_model=RevenueCatWebhookResponse)
async def receive_revenuecat_webhook(
    request: Request,
    authorization: str | None = Header(default=None),
) -> RevenueCatWebhookResponse:
    expected_values = _valid_webhook_authorization_values()
    if expected_values:
        if authorization not in expected_values:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid RevenueCat webhook authorization",
            )

    payload = await request.json()
    await process_revenuecat_webhook(payload)
    return RevenueCatWebhookResponse()
