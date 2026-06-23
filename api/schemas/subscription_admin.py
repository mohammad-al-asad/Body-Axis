from datetime import datetime

from pydantic import BaseModel, Field


class SubscriptionMetric(BaseModel):
    value: float | int | None
    change_percent: float | None = None
    available: bool = True


class SubscriptionMetrics(BaseModel):
    active_subscribers: SubscriptionMetric
    monthly_revenue_usd: SubscriptionMetric
    yearly_members_percent: SubscriptionMetric
    renewal_rate_percent: SubscriptionMetric


class SubscriptionPlanSummary(BaseModel):
    product_id: str
    store_identifier: str | None = None
    name: str
    duration: str | None = None
    interval: str
    subscribers: int
    price: float | None = None
    price_currency: str | None = None
    price_country: str | None = None
    state: str | None = None


class RevenuePoint(BaseModel):
    label: str
    period_start: datetime
    revenue_usd: float


class EntitlementOption(BaseModel):
    id: str
    lookup_key: str
    display_name: str


class CustomerEntitlement(BaseModel):
    id: str
    lookup_key: str
    display_name: str
    expires_at: datetime | None = None
    promotional: bool = False


class AdminSubscriptionRow(BaseModel):
    id: str
    customer_id: str
    name: str
    email: str
    product_id: str | None = None
    plan_name: str
    subscription_id: str | None = None
    expires_at: datetime | None = None
    store: str | None = None
    environment: str | None = None
    status: str
    auto_renewal_status: str | None = None
    will_renew: bool | None = None
    gives_access: bool = False
    pending_payment: bool = False
    total_revenue_usd: float = 0
    first_seen_at: datetime | None = None
    last_seen_at: datetime | None = None
    country: str | None = None
    platform: str | None = None
    entitlements: list[CustomerEntitlement] = Field(default_factory=list)


class SubscriptionActivity(BaseModel):
    id: str
    title: str
    description: str
    event_type: str
    occurred_at: datetime
    environment: str | None = None
    amount_usd: float | None = None


class SubscriptionDataIssue(BaseModel):
    code: str
    title: str
    message: str


class SubscriptionDataSource(BaseModel):
    customer_status: str
    event_history: str
    environment: str = "PRODUCTION"
    production_event_count: int
    sandbox_event_count: int
    last_event_at: datetime | None = None
    generated_at: datetime


class SubscriptionAnalyticsResponse(BaseModel):
    source: SubscriptionDataSource
    metrics: SubscriptionMetrics
    plans: list[SubscriptionPlanSummary]
    entitlements: list[EntitlementOption]
    revenue_growth: list[RevenuePoint]
    subscriptions: list[AdminSubscriptionRow]
    recent_activity: list[SubscriptionActivity]
    missing_data: list[SubscriptionDataIssue]


class GrantEntitlementRequest(BaseModel):
    customer_id: str = Field(min_length=1, max_length=1500)
    entitlement_id: str = Field(min_length=1, max_length=255)
    expires_at: datetime


class RevokeEntitlementRequest(BaseModel):
    customer_id: str = Field(min_length=1, max_length=1500)
    entitlement_id: str = Field(min_length=1, max_length=255)


class EntitlementActionResponse(BaseModel):
    message: str
