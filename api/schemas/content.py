from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ContentSlug(str, Enum):
    about = "about"
    terms = "terms"
    privacy = "privacy"


class ContentPageRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    content: str = Field(min_length=1)
    status: str = Field(default="published", pattern="^(draft|published)$")


class ContentPageResponse(BaseModel):
    slug: ContentSlug
    title: str
    content: str
    status: str
    updated_at: datetime
    created_at: datetime


class IntroductionContentResponse(BaseModel):
    message_title: str
    message_quote: str
    video_url: str
    thumbnail_url: str | None = None
    video_key: str | None = None
    thumbnail_key: str | None = None
    video_file_name: str | None = None
    video_file_size: int | None = None
    thumbnail_file_name: str | None = None
    thumbnail_file_size: int | None = None
    status: str
    updated_at: datetime
    created_at: datetime


class FAQRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1, max_length=5000)
    category: str = Field(default="App", max_length=80)
    status: str = Field(default="published", pattern="^(draft|published)$")


class FAQResponse(BaseModel):
    id: str
    question: str
    answer: str
    category: str
    status: str
    created_at: datetime
    updated_at: datetime


class FAQListResponse(BaseModel):
    items: list[FAQResponse]
    total: int


class SupportMessageCreate(BaseModel):
    category: str = Field(min_length=1, max_length=80)
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


class SupportMessageResponse(BaseModel):
    id: str
    user_id: str | None = None
    name: str
    email: str
    category: str
    subject: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime


class SupportMessageListResponse(BaseModel):
    items: list[SupportMessageResponse]
    total: int


class SupportMessageStatusUpdate(BaseModel):
    status: str = Field(pattern="^(Unread|Read|Archived)$")
