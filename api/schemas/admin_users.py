from datetime import date, datetime

from pydantic import BaseModel


class AdminUserRow(BaseModel):
    id: str
    name: str
    date_of_birth: date | None = None
    email: str
    join_date: datetime | None = None
    current_plan: str
    total: int
    status: str
    sessions: int


class AdminUserListResponse(BaseModel):
    items: list[AdminUserRow]
    total: int
    page: int
    page_size: int
    total_pages: int
