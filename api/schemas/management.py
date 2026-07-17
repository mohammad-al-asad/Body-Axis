from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class Phase(str, Enum):
    reset = "reset"
    control = "control"
    integrate = "integrate"


class Equipment(str, Enum):
    yoga_mat = "Yoga Mat"
    resistance_band = "Resistance Band"
    dumbbell = "Dumbbell"
    foam_roller = "Foam Roller"
    lacrosse_ball = "Lacrosse Ball"
    yoga_block = "Yoga Block"
    bench = "Bench"
    mini_band = "Mini Band"


class PublishStatus(str, Enum):
    draft = "draft"
    published = "published"


class TargetArea(str, Enum):
    shoulder = "SHOULDER"
    core = "CORE"
    outer_hip = "OUTER HIP"
    front_hip = "FRONT HIP"
    foot_ankle = "FOOT/ANKLE"
    neck_upper_back = "NECK/UPPER BACK"
    middle_back = "MIDDLE BACK"
    lower_back = "LOWER BACK"
    glutes = "GLUTES"
    back_hip = "BACK HIP"
    hamstring = "HAMSTRING"
    calf = "CALF"


class UseCase(str, Enum):
    move_more_freely = "Move More Freely"
    ease_everyday_soreness = "Ease Everyday Soreness"
    build_strength_control = "Build Strength & Control"
    improve_performance = "Improve Performance"


class VideoResponse(BaseModel):
    id: str
    exercise_id: str
    video_name: str
    video_description: str
    thumbnail_url: str
    video_url: str
    duration_seconds: float | None = None
    thumbnail_key: str | None = None
    video_key: str | None = None
    video_file_name: str | None = None
    video_file_size: int | None = None
    created_at: datetime
    updated_at: datetime


class VideoListResponse(BaseModel):
    items: list[VideoResponse]
    total: int


class VideoMultipartInitiateRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=255)
    file_size: int = Field(gt=0)


class VideoMultipartPart(BaseModel):
    part_number: int = Field(ge=1)
    url: str


class VideoMultipartInitiateResponse(BaseModel):
    upload_id: str
    key: str
    public_url: str
    part_size: int = Field(gt=0)
    parts: list[VideoMultipartPart]


class VideoMultipartCompletedPart(BaseModel):
    part_number: int = Field(ge=1)
    etag: str = Field(min_length=1)


class VideoMultipartAbortRequest(BaseModel):
    upload_id: str = Field(min_length=1)
    key: str = Field(min_length=1)


class ExerciseBase(BaseModel):
    exercise_id: str = Field(min_length=1, max_length=80)
    exercise_name: str = Field(min_length=1, max_length=160)
    sets: int = Field(ge=1, le=999)
    reps: str = Field(min_length=1, max_length=80)
    primary_intent: str = Field(min_length=1, max_length=500)
    secondary_benefits: str = Field(min_length=1, max_length=1000)
    equipment_needed: list[Equipment] = Field(default_factory=list)
    tutorial_video_id: str
    short_clip_video_id: str
    status: PublishStatus = PublishStatus.published

    @field_validator("equipment_needed")
    @classmethod
    def unique_equipment(cls, value: list[Equipment]) -> list[Equipment]:
        return list(dict.fromkeys(value))

    @model_validator(mode="after")
    def videos_must_be_distinct(self) -> "ExerciseBase":
        if self.tutorial_video_id == self.short_clip_video_id:
            raise ValueError("Tutorial video and short clip video must be different")
        return self


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(ExerciseBase):
    pass


class AssociatedVideo(BaseModel):
    id: str
    exercise_id: str
    video_name: str
    thumbnail_url: str
    video_url: str
    duration_seconds: float | None = None


class ExerciseResponse(ExerciseBase):
    id: str
    tutorial_video: AssociatedVideo
    short_clip_video: AssociatedVideo
    created_at: datetime
    updated_at: datetime


class ExerciseListResponse(BaseModel):
    items: list[ExerciseResponse]
    total: int


class PlanExerciseInput(BaseModel):
    exercise_id: str


class PlanPhasesInput(BaseModel):
    reset: list[PlanExerciseInput] = Field(default_factory=list)
    control: list[PlanExerciseInput] = Field(default_factory=list)
    integrate: list[PlanExerciseInput] = Field(default_factory=list)

    @model_validator(mode="after")
    def exercises_must_be_unique(self) -> "PlanPhasesInput":
        exercise_ids = [
            item.exercise_id
            for phase_items in (self.reset, self.control, self.integrate)
            for item in phase_items
        ]
        if len(exercise_ids) != len(set(exercise_ids)):
            raise ValueError("An exercise can only be added to a plan once")
        return self


class PlanBase(BaseModel):
    plan_id: str = Field(min_length=1, max_length=80)
    plan_name: str = Field(min_length=1, max_length=160)
    target_area: TargetArea
    use_case: UseCase
    duration: str = Field(min_length=1, max_length=80)
    phases: PlanPhasesInput
    status: PublishStatus = PublishStatus.published


class PlanCreate(PlanBase):
    pass


class PlanUpdate(PlanBase):
    pass


class PlanExerciseResponse(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: int
    reps: str
    equipment_needed: list[Equipment]


class PlanPhasesResponse(BaseModel):
    reset: list[PlanExerciseResponse]
    control: list[PlanExerciseResponse]
    integrate: list[PlanExerciseResponse]


class PlanResponse(BaseModel):
    id: str
    plan_id: str
    plan_name: str
    target_area: str
    use_case: str
    equipment_needed: list[Equipment]
    duration: str
    phases: PlanPhasesResponse
    status: PublishStatus
    created_at: datetime
    updated_at: datetime


class PlanListResponse(BaseModel):
    items: list[PlanResponse]
    total: int
