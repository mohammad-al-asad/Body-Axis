from datetime import datetime, timezone
from database import db

async def create_notification(message: str, notification_type: str = "general") -> None:
    doc = {
        "message": message,
        "type": notification_type,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.notifications.insert_one(doc)
