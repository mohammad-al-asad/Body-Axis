from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from core.dependencies import get_current_admin
from database import db
from schemas.notifications import NotificationListResponse, NotificationResponse

router = APIRouter(prefix="/admin/notifications", tags=["Admin Notifications"])

def _serialize_notification(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "message": doc["message"],
        "time": doc["created_at"],
        "is_read": doc.get("is_read", False),
        "type": doc.get("type", "general"),
    }

@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    current_admin: dict = Depends(get_current_admin)
) -> NotificationListResponse:
    cursor = db.notifications.find().sort("created_at", -1).limit(100)
    docs = await cursor.to_list(length=100)
    notifications = [_serialize_notification(d) for d in docs]
    
    unread_count = await db.notifications.count_documents({"is_read": False})
    
    return NotificationListResponse(
        notifications=notifications,
        unread_count=unread_count
    )

@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_read(
    current_admin: dict = Depends(get_current_admin)
):
    await db.notifications.update_many(
        {"is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"status": "success"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    result = await db.notifications.delete_one({"_id": ObjectId(notification_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"status": "success"}
