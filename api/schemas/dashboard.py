from datetime import date, datetime

from pydantic import BaseModel


class DashboardMetric(BaseModel):
    value: int
    change_percent: float | None = None


class DashboardStats(BaseModel):
    total_users: DashboardMetric
    active_users: DashboardMetric
    total_plans: DashboardMetric
    total_exercises: DashboardMetric


class UserGrowthPoint(BaseModel):
    label: str
    period_start: date
    registrations: int
    active_users: int
    intake_completed: int
    intake_completion_percent: int


class RecentUserActivity(BaseModel):
    id: str
    name: str
    email: str
    auth_provider: str
    created_at: datetime
    last_login_at: datetime | None = None
    active: bool


class DashboardAnalyticsResponse(BaseModel):
    stats: DashboardStats
    user_growth: list[UserGrowthPoint]
    recent_users: list[RecentUserActivity]
    active_user_window_days: int = 30
