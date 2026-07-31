import json

from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile, status
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

from core.dependencies import get_current_admin, get_current_user
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
    SupportMessageStatusUpdate,
)
from schemas.management import (
    VideoMultipartAbortRequest,
    VideoMultipartCompletedPart,
    VideoMultipartInitiateRequest,
    VideoMultipartInitiateResponse,
)
from services.content_service import (
    create_faq,
    create_support_message,
    delete_faq,
    delete_support_message,
    get_content_page,
    get_introduction_content,
    list_faqs,
    list_support_messages,
    update_faq,
    update_support_status,
    upsert_content_page,
    upsert_introduction_content,
)
from services.s3_service import abort_multipart_upload, create_multipart_upload

router = APIRouter(tags=["App Content"])


def _parse_completed_parts(value: str | None) -> list[dict[str, str | int]] | None:
    if not value:
        return None
    try:
        parsed = json.loads(value)
        return [
            item.model_dump()
            for item in [VideoMultipartCompletedPart.model_validate(part) for part in parsed]
        ]
    except (json.JSONDecodeError, ValidationError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid multipart upload parts payload",
        ) from None


@router.get("/content/introduction", response_model=IntroductionContentResponse)
async def get_public_introduction_content() -> IntroductionContentResponse:
    return await get_introduction_content()


@router.get("/content/{slug}", response_model=ContentPageResponse)
async def get_public_content(slug: ContentSlug) -> ContentPageResponse:
    return await get_content_page(slug)


@router.get("/faqs", response_model=FAQListResponse)
async def get_public_faqs(
    search: str = Query(default="", max_length=160),
) -> FAQListResponse:
    return await list_faqs(include_drafts=False, search=search)


@router.post(
    "/support/messages",
    response_model=SupportMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_support_message(
    payload: SupportMessageCreate,
    current_user: dict = Depends(get_current_user),
) -> SupportMessageResponse:
    return await create_support_message(current_user, payload)


@router.get("/admin/content/introduction", response_model=IntroductionContentResponse)
async def get_admin_introduction_content(
    current_admin: dict = Depends(get_current_admin),
) -> IntroductionContentResponse:
    del current_admin
    return await get_introduction_content(include_drafts=True)


@router.put("/admin/content/introduction", response_model=IntroductionContentResponse)
async def update_admin_introduction_content(
    message_title: str = Form(min_length=1, max_length=160),
    message_quote: str = Form(min_length=1, max_length=1000),
    status_value: str = Form(default="published", alias="status"),
    video_file: UploadFile | None = File(default=None),
    thumbnail_file: UploadFile | None = File(default=None),
    video_upload_key: str | None = Form(default=None),
    video_upload_id: str | None = Form(default=None),
    video_upload_parts: str | None = Form(default=None),
    video_file_name: str | None = Form(default=None),
    video_file_size: int | None = Form(default=None),
    current_admin: dict = Depends(get_current_admin),
) -> IntroductionContentResponse:
    del current_admin
    return await upsert_introduction_content(
        message_title,
        message_quote,
        status_value,
        video_file,
        thumbnail_file,
        video_upload_key,
        video_upload_id,
        _parse_completed_parts(video_upload_parts),
        video_file_name,
        video_file_size,
    )


@router.post(
    "/admin/content/introduction/uploads/multipart/initiate",
    response_model=VideoMultipartInitiateResponse,
)
async def initiate_introduction_video_multipart_upload(
    payload: VideoMultipartInitiateRequest,
    current_admin: dict = Depends(get_current_admin),
) -> VideoMultipartInitiateResponse:
    del current_admin
    if not payload.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Introduction upload must be a video file",
        )
    return VideoMultipartInitiateResponse(
        **(
            await run_in_threadpool(
                create_multipart_upload,
                payload.file_name,
                payload.content_type,
                payload.file_size,
                "introduction",
            )
        )
    )


@router.post(
    "/admin/content/introduction/uploads/multipart/abort",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def abort_introduction_video_multipart_upload(
    payload: VideoMultipartAbortRequest,
    current_admin: dict = Depends(get_current_admin),
) -> Response:
    del current_admin
    await run_in_threadpool(abort_multipart_upload, payload.key, payload.upload_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/admin/content/{slug}", response_model=ContentPageResponse)
async def get_admin_content(
    slug: ContentSlug,
    current_admin: dict = Depends(get_current_admin),
) -> ContentPageResponse:
    del current_admin
    return await get_content_page(slug, include_drafts=True)


@router.put("/admin/content/{slug}", response_model=ContentPageResponse)
async def update_admin_content(
    slug: ContentSlug,
    payload: ContentPageRequest,
    current_admin: dict = Depends(get_current_admin),
) -> ContentPageResponse:
    del current_admin
    return await upsert_content_page(slug, payload)


@router.get("/admin/faqs", response_model=FAQListResponse)
async def get_admin_faqs(
    search: str = Query(default="", max_length=160),
    current_admin: dict = Depends(get_current_admin),
) -> FAQListResponse:
    del current_admin
    return await list_faqs(include_drafts=True, search=search)


@router.post("/admin/faqs", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_faq(
    payload: FAQRequest,
    current_admin: dict = Depends(get_current_admin),
) -> FAQResponse:
    del current_admin
    return await create_faq(payload)


@router.put("/admin/faqs/{faq_id}", response_model=FAQResponse)
async def update_admin_faq(
    faq_id: str,
    payload: FAQRequest,
    current_admin: dict = Depends(get_current_admin),
) -> FAQResponse:
    del current_admin
    return await update_faq(faq_id, payload)


@router.delete("/admin/faqs/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_faq(
    faq_id: str,
    current_admin: dict = Depends(get_current_admin),
) -> Response:
    del current_admin
    await delete_faq(faq_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/admin/support/messages", response_model=SupportMessageListResponse)
async def get_admin_support_messages(
    search: str = Query(default="", max_length=160),
    current_admin: dict = Depends(get_current_admin),
) -> SupportMessageListResponse:
    del current_admin
    return await list_support_messages(search)


@router.put("/admin/support/messages/{message_id}", response_model=SupportMessageResponse)
async def update_admin_support_message(
    message_id: str,
    payload: SupportMessageStatusUpdate,
    current_admin: dict = Depends(get_current_admin),
) -> SupportMessageResponse:
    del current_admin
    return await update_support_status(message_id, payload.status)


@router.delete("/admin/support/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_support_message(
    message_id: str,
    current_admin: dict = Depends(get_current_admin),
) -> Response:
    del current_admin
    await delete_support_message(message_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
