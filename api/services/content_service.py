from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, UploadFile, status
from pymongo import ASCENDING, DESCENDING
from starlette.concurrency import run_in_threadpool

from database import db
from schemas.content import (
    ContentPageRequest,
    ContentPageResponse,
    ContentSlug,
    FAQListResponse,
    FAQRequest,
    FAQResponse,
    IntroductionContentResponse,
    SupportMessageCreate,
    SupportMessageListResponse,
    SupportMessageResponse,
)
from services.s3_service import complete_multipart_upload, delete_file, upload_file

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

INTRODUCTION_SLUG = "introduction"

DEFAULT_INTRODUCTION_CONTENT = {
    "message_title": "Precision in every movement.",
    "message_quote": (
        "“I built Body Axis™ to bridge the gap between hard work and scientific mobility. "
        "We don’t just track reps; we track how your joints interact with the world.”"
    ),
    "video_url": (
        "https://archive.org/download/5PillarsOfIslamShahadahBecomingAMuslimAbuHafsah/"
        "AmazingRecitationOfHolyQuran_SurahAlAhzabverse70-72_zahilZakariaAlHafiz.mp4"
    ),
    "thumbnail_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
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


def _introduction_response(document: dict[str, Any]) -> IntroductionContentResponse:
    return IntroductionContentResponse(
        message_title=document["message_title"],
        message_quote=document["message_quote"],
        video_url=document["video_url"],
        thumbnail_url=document.get("thumbnail_url") or DEFAULT_INTRODUCTION_CONTENT["thumbnail_url"],
        video_key=document.get("video_key"),
        thumbnail_key=document.get("thumbnail_key"),
        video_file_name=document.get("video_file_name"),
        video_file_size=document.get("video_file_size"),
        thumbnail_file_name=document.get("thumbnail_file_name"),
        thumbnail_file_size=document.get("thumbnail_file_size"),
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


async def get_introduction_content(
    include_drafts: bool = False,
) -> IntroductionContentResponse:
    query: dict[str, Any] = {"slug": INTRODUCTION_SLUG}
    if not include_drafts:
        query["status"] = "published"

    document = await db.app_content.find_one(query)
    if document:
        return _introduction_response(document)

    now = _now()
    return IntroductionContentResponse(
        message_title=DEFAULT_INTRODUCTION_CONTENT["message_title"],
        message_quote=DEFAULT_INTRODUCTION_CONTENT["message_quote"],
        video_url=DEFAULT_INTRODUCTION_CONTENT["video_url"],
        thumbnail_url=DEFAULT_INTRODUCTION_CONTENT["thumbnail_url"],
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


async def upsert_introduction_content(
    message_title: str,
    message_quote: str,
    status_value: str,
    video_file: UploadFile | None = None,
    thumbnail_file: UploadFile | None = None,
    video_upload_key: str | None = None,
    video_upload_id: str | None = None,
    video_upload_parts: list[dict[str, Any]] | None = None,
    uploaded_video_file_name: str | None = None,
    uploaded_video_file_size: int | None = None,
) -> IntroductionContentResponse:
    if status_value not in {"draft", "published"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Status must be draft or published",
        )

    existing = await db.app_content.find_one({"slug": INTRODUCTION_SLUG})
    video_url = existing.get("video_url") if existing else DEFAULT_INTRODUCTION_CONTENT["video_url"]
    thumbnail_url = (
        existing.get("thumbnail_url") if existing else None
    ) or DEFAULT_INTRODUCTION_CONTENT["thumbnail_url"]
    video_key = existing.get("video_key") if existing else None
    thumbnail_key = existing.get("thumbnail_key") if existing else None
    video_file_name = existing.get("video_file_name") if existing else None
    video_file_size = existing.get("video_file_size") if existing else None
    thumbnail_file_name = existing.get("thumbnail_file_name") if existing else None
    thumbnail_file_size = existing.get("thumbnail_file_size") if existing else None
    old_video_key = None
    old_thumbnail_key = None

    if video_file:
        if video_file.content_type and not video_file.content_type.startswith("video/"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Introduction upload must be a video file",
            )
        video_url, video_key = await run_in_threadpool(
            upload_file,
            video_file.file,
            video_file.filename,
            video_file.content_type,
            "introduction",
        )
        video_file_name = video_file.filename
        video_file_size = video_file.size
        old_video_key = existing.get("video_key") if existing else None
    elif video_upload_key and video_upload_id and video_upload_parts:
        video_url, video_key = await run_in_threadpool(
            complete_multipart_upload,
            video_upload_key,
            video_upload_id,
            video_upload_parts,
        )
        video_file_name = uploaded_video_file_name
        video_file_size = uploaded_video_file_size
        old_video_key = existing.get("video_key") if existing else None

    if thumbnail_file:
        if thumbnail_file.content_type and not thumbnail_file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Introduction thumbnail must be an image file",
            )
        thumbnail_url, thumbnail_key = await run_in_threadpool(
            upload_file,
            thumbnail_file.file,
            thumbnail_file.filename,
            thumbnail_file.content_type,
            "introduction-thumbnails",
        )
        thumbnail_file_name = thumbnail_file.filename
        thumbnail_file_size = thumbnail_file.size
        old_thumbnail_key = existing.get("thumbnail_key") if existing else None

    now = _now()
    document = {
        "slug": INTRODUCTION_SLUG,
        "message_title": message_title.strip(),
        "message_quote": message_quote.strip(),
        "video_url": video_url,
        "thumbnail_url": thumbnail_url,
        "video_key": video_key,
        "thumbnail_key": thumbnail_key,
        "video_file_name": video_file_name,
        "video_file_size": video_file_size,
        "thumbnail_file_name": thumbnail_file_name,
        "thumbnail_file_size": thumbnail_file_size,
        "status": status_value,
        "updated_at": now,
    }

    if existing:
        await db.app_content.update_one({"_id": existing["_id"]}, {"$set": document})
        updated = await db.app_content.find_one({"_id": existing["_id"]})
    else:
        document["created_at"] = now
        result = await db.app_content.insert_one(document)
        document["_id"] = result.inserted_id
        updated = document

    if old_video_key and old_video_key != video_key:
        await run_in_threadpool(delete_file, old_video_key)
    if old_thumbnail_key and old_thumbnail_key != thumbnail_key:
        await run_in_threadpool(delete_file, old_thumbnail_key)

    return _introduction_response(updated)


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
