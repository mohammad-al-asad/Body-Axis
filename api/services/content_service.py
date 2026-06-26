from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo import ASCENDING, DESCENDING

from database import db
from schemas.content import (
    ContentPageRequest,
    ContentPageResponse,
    ContentSlug,
    FAQListResponse,
    FAQRequest,
    FAQResponse,
    SupportMessageCreate,
    SupportMessageListResponse,
    SupportMessageResponse,
)

DEFAULT_CONTENT: dict[str, dict[str, str]] = {
    "about": {
        "title": "About Body Axis",
        "content": "Body Axis helps you build personalized movement sessions from your target area, goals, and corrective exercise plans.",
    },
    "terms": {
        "title": "Terms of Service",
        "content": "By using Body Axis, you agree to use the app for general wellness and movement education. Body Axis is not a replacement for medical advice.",
    },
    "privacy": {
        "title": "Privacy Policy",
        "content": "We collect account and movement-session data to personalize your experience. We do not sell your personal data.",
    },
}


async def ensure_content_indexes() -> None:
    await db.app_content.create_index("slug", unique=True)
    await db.faqs.create_index([("category", ASCENDING), ("status", ASCENDING)])
    await db.support_messages.create_index([("created_at", DESCENDING)])
    await db.support_messages.create_index([("status", ASCENDING)])


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _content_response(document: dict[str, Any]) -> ContentPageResponse:
    return ContentPageResponse(
        slug=document["slug"],
        title=document["title"],
        content=document["content"],
        status=document.get("status", "published"),
        created_at=document["created_at"],
        updated_at=document["updated_at"],
    )


def _faq_response(document: dict[str, Any]) -> FAQResponse:
    return FAQResponse(
        id=str(document["_id"]),
        question=document["question"],
        answer=document["answer"],
        category=document.get("category", "App"),
        status=document.get("status", "published"),
        created_at=document["created_at"],
        updated_at=document["updated_at"],
    )


def _support_response(document: dict[str, Any]) -> SupportMessageResponse:
    return SupportMessageResponse(
        id=str(document["_id"]),
        user_id=document.get("user_id"),
        name=document.get("name") or "Unknown user",
        email=document.get("email") or "unknown@example.com",
        category=document.get("category", "Other"),
        subject=document["subject"],
        message=document["message"],
        status=document.get("status", "Unread"),
        created_at=document["created_at"],
        updated_at=document["updated_at"],
    )


async def get_content_page(
    slug: ContentSlug,
    include_drafts: bool = False,
) -> ContentPageResponse:
    query: dict[str, Any] = {"slug": slug.value}
    if not include_drafts:
        query["status"] = "published"

    document = await db.app_content.find_one(query)
    if document:
        return _content_response(document)

    fallback = DEFAULT_CONTENT[slug.value]
    now = _now()
    return ContentPageResponse(
        slug=slug,
        title=fallback["title"],
        content=fallback["content"],
        status="published",
        created_at=now,
        updated_at=now,
    )


async def upsert_content_page(
    slug: ContentSlug,
    payload: ContentPageRequest,
) -> ContentPageResponse:
    now = _now()
    existing = await db.app_content.find_one({"slug": slug.value})
    document = {
        "slug": slug.value,
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "status": payload.status,
        "updated_at": now,
    }
    if existing:
        await db.app_content.update_one({"_id": existing["_id"]}, {"$set": document})
        updated = await db.app_content.find_one({"_id": existing["_id"]})
        return _content_response(updated)

    document["created_at"] = now
    result = await db.app_content.insert_one(document)
    document["_id"] = result.inserted_id
    return _content_response(document)


async def list_faqs(
    include_drafts: bool = False,
    search: str = "",
) -> FAQListResponse:
    query: dict[str, Any] = {}
    if not include_drafts:
        query["status"] = "published"
    if search:
        query["$or"] = [
            {"question": {"$regex": search, "$options": "i"}},
            {"answer": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]

    documents = await db.faqs.find(query).sort(
        [("category", ASCENDING), ("created_at", DESCENDING)]
    ).to_list(length=None)
    return FAQListResponse(
        items=[_faq_response(document) for document in documents],
        total=len(documents),
    )


async def create_faq(payload: FAQRequest) -> FAQResponse:
    now = _now()
    document = {
        "question": payload.question.strip(),
        "answer": payload.answer.strip(),
        "category": payload.category.strip() or "App",
        "status": payload.status,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.faqs.insert_one(document)
    document["_id"] = result.inserted_id
    return _faq_response(document)


async def update_faq(faq_id: str, payload: FAQRequest) -> FAQResponse:
    try:
        object_id = ObjectId(faq_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="FAQ not found") from None

    existing = await db.faqs.find_one({"_id": object_id})
    if not existing:
        raise HTTPException(status_code=404, detail="FAQ not found")

    await db.faqs.update_one(
        {"_id": object_id},
        {
            "$set": {
                "question": payload.question.strip(),
                "answer": payload.answer.strip(),
                "category": payload.category.strip() or "App",
                "status": payload.status,
                "updated_at": _now(),
            }
        },
    )
    updated = await db.faqs.find_one({"_id": object_id})
    return _faq_response(updated)


async def delete_faq(faq_id: str) -> None:
    try:
        object_id = ObjectId(faq_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="FAQ not found") from None
    result = await db.faqs.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")


async def create_support_message(
    user: dict[str, Any],
    payload: SupportMessageCreate,
) -> SupportMessageResponse:
    now = _now()
    document = {
        "user_id": str(user["_id"]),
        "name": user.get("full_name") or user["email"].split("@")[0],
        "email": user["email"],
        "category": payload.category.strip(),
        "subject": payload.subject.strip(),
        "message": payload.message.strip(),
        "status": "Unread",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.support_messages.insert_one(document)
    document["_id"] = result.inserted_id
    from services.notification_service import create_notification
    await create_notification(
        message=f"New support message: {document['subject']}",
        notification_type="support_message"
    )
    return _support_response(document)


async def list_support_messages(search: str = "") -> SupportMessageListResponse:
    query: dict[str, Any] = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}},
            {"message": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]

    documents = await db.support_messages.find(query).sort(
        "created_at",
        DESCENDING,
    ).to_list(length=None)
    return SupportMessageListResponse(
        items=[_support_response(document) for document in documents],
        total=len(documents),
    )


async def update_support_status(message_id: str, new_status: str) -> SupportMessageResponse:
    try:
        object_id = ObjectId(message_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Support message not found") from None

    existing = await db.support_messages.find_one({"_id": object_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Support message not found")

    await db.support_messages.update_one(
        {"_id": object_id},
        {"$set": {"status": new_status, "updated_at": _now()}},
    )
    updated = await db.support_messages.find_one({"_id": object_id})
    return _support_response(updated)


async def delete_support_message(message_id: str) -> None:
    try:
        object_id = ObjectId(message_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Support message not found") from None
    result = await db.support_messages.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Support message not found")
