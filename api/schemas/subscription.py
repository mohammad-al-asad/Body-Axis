from datetime import datetime

from pydantic import BaseModel


class SubscriptionStatusResponse(BaseModel):
    active: bool
    entitlement_id: str
    product_id: str | None = None
    store: str | None = None
    environment: str | None = None
    expires_at: datetime | None = None
    will_renew: bool | None = None
    management_url: str | None = None
    last_event_type: str | None = None
    updated_at: datetime | None = None


class RevenueCatWebhookResponse(BaseModel):
    received: bool = True
