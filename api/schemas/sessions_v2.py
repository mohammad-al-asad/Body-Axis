from pydantic import BaseModel, Field, model_validator
from schemas.sessions import SessionPlanResponse


class MatchingPlansRequest(BaseModel):
    target_area: str | None = Field(default=None, max_length=80)
    target_areas: list[str] = Field(default_factory=list)
    pain_points: list[str] = Field(default_factory=list)
    user_case: str | None = Field(default=None, max_length=80)
    primary_goal: str | None = Field(default=None, max_length=80)
    session_duration: int | None = Field(default=None, ge=1, le=240)

    @model_validator(mode="after")
    def target_and_case_required(self) -> "MatchingPlansRequest":
        if not self.target_area and not self.target_areas and not self.pain_points:
            raise ValueError("target_area, target_areas, or pain_points is required")
        if not self.user_case and not self.primary_goal:
            raise ValueError("user_case or primary_goal is required")
        return self


class MatchingPlansResponse(BaseModel):
    items: list[SessionPlanResponse]
    total: int


class SessionCreateRequestV2(BaseModel):
    target_area: str | None = Field(default=None, max_length=80)
    target_areas: list[str] = Field(default_factory=list)
    pain_points: list[str] = Field(default_factory=list)
    user_case: str | None = Field(default=None, max_length=80)
    primary_goal: str | None = Field(default=None, max_length=80)
    session_name: str | None = Field(default=None, max_length=160)
    schedule_days: int | None = Field(default=None, ge=1, le=7)
    schedule_weeks: int | None = Field(default=None, ge=1, le=52)
    session_duration: int | None = Field(default=None, ge=1, le=240)
    plan_ids: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def target_and_case_required(self) -> "SessionCreateRequestV2":
        if not self.target_area and not self.target_areas and not self.pain_points:
            raise ValueError("target_area, target_areas, or pain_points is required")
        if not self.user_case and not self.primary_goal:
            raise ValueError("user_case or primary_goal is required")
        return self
