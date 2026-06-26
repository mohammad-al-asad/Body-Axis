from datetime import datetime
from pydantic import BaseModel, Field

class NotificationResponse(BaseModel):
    id: str
    message: str
    time: datetime
    is_read: bool = False
    type: str

class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    unread_count: int
