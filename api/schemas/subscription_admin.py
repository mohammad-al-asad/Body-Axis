from datetime import datetime

from pydantic import BaseModel


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
    name: str
    interval: str
    subscribers: int
    observed_price_usd: float | None = None
    conversion_percent: float | None = None
    environment: str


class RevenuePoint(BaseModel):
    label: str
    period_start: datetime
    revenue_usd: float


class AdminSubscriptionRow(BaseModel):
    id: str
    name: str
    email: str
    product_id: str | None = None
    plan_name: str
    expires_at: datetime | None = None
    store: str | None = None
    environment: str | None = None
    status: str
    will_renew: bool | None = None


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
    revenue_growth: list[RevenuePoint]
    subscriptions: list[AdminSubscriptionRow]
    recent_activity: list[SubscriptionActivity]
    missing_data: list[SubscriptionDataIssue]
