from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator

from schemas.management import Equipment, Phase, PublishStatus


class SessionCreateRequest(BaseModel):
    target_area: str | None = Field(default=None, max_length=80)
    target_areas: list[str] = Field(default_factory=list)
    pain_points: list[str] = Field(default_factory=list)
    user_case: str | None = Field(default=None, max_length=80)
    primary_goal: str | None = Field(default=None, max_length=80)
    session_name: str | None = Field(default=None, max_length=160)
    schedule_days: int | None = Field(default=None, ge=1, le=7)
    schedule_weeks: int | None = Field(default=None, ge=1, le=52)
    session_duration: int | None = Field(default=None, ge=1, le=240)

    @model_validator(mode="after")
    def target_and_case_required(self) -> "SessionCreateRequest":
        if not self.target_area and not self.target_areas and not self.pain_points:
            raise ValueError("target_area, target_areas, or pain_points is required")
        if not self.user_case and not self.primary_goal:
            raise ValueError("user_case or primary_goal is required")
        return self


class SessionVideoResponse(BaseModel):
    id: str
    exercise_id: str
    video_name: str
    thumbnail_url: str
    video_url: str


class SessionExerciseResponse(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: int
    reps: str
    phase: Phase
    equipment_needed: list[Equipment]
    primary_intent: str | None = None
    secondary_benefits: str | None = None
    tutorial_video: SessionVideoResponse | None = None
    short_clip_video: SessionVideoResponse | None = None


class SessionPlanPhasesResponse(BaseModel):
    reset: list[SessionExerciseResponse]
    control: list[SessionExerciseResponse]
    integrate: list[SessionExerciseResponse]


class SessionPlanResponse(BaseModel):
    id: str
    plan_id: str
    plan_name: str
    target_area: str
    use_case: str
    equipment_needed: list[Equipment]
    duration: str
    phases: SessionPlanPhasesResponse
    status: PublishStatus


class MovementSessionResponse(BaseModel):
    id: str
    user_id: str
    session_name: str
    target_areas: list[str]
    user_case: str
    schedule_days: int | None = None
    schedule_weeks: int | None = None
    session_duration: int | None = None
    plans: list[SessionPlanResponse]
    plan_count: int
    exercise_count: int
    status: str
    created_at: datetime
    updated_at: datetime


class MovementSessionListResponse(BaseModel):
    items: list[MovementSessionResponse]
    total: int


def movement_session_from_document(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(document["_id"]),
        "user_id": str(document["user_id"]),
        "session_name": document["session_name"],
        "target_areas": document.get("target_areas", []),
        "user_case": document["user_case"],
        "schedule_days": document.get("schedule_days"),
        "schedule_weeks": document.get("schedule_weeks"),
        "session_duration": document.get("session_duration"),
        "plans": document.get("plans", []),
        "plan_count": document.get("plan_count", 0),
        "exercise_count": document.get("exercise_count", 0),
        "status": document.get("status", "active"),
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }
