import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

from core.dependencies import get_current_admin
from database import db
from schemas.management import (
    VideoListResponse,
    VideoMultipartAbortRequest,
    VideoMultipartCompletedPart,
    VideoMultipartInitiateRequest,
    VideoMultipartInitiateResponse,
    VideoResponse,
)
from services.management_service import (
    create_video,
    delete_video,
    serialize_video,
    update_video,
)
from services.s3_service import abort_multipart_upload, create_multipart_upload

router = APIRouter(
    prefix="/videos",
    tags=["Video Management"],
    dependencies=[Depends(get_current_admin)],
)


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


@router.post(
    "/uploads/multipart/initiate",
    response_model=VideoMultipartInitiateResponse,
)
async def initiate_video_multipart_upload(
    payload: VideoMultipartInitiateRequest,
) -> VideoMultipartInitiateResponse:
    return VideoMultipartInitiateResponse(
        **(
            await run_in_threadpool(
                create_multipart_upload,
                payload.file_name,
                payload.content_type,
                payload.file_size,
                "videos",
            )
        )
    )


@router.post("/uploads/multipart/abort", status_code=status.HTTP_204_NO_CONTENT)
async def abort_video_multipart_upload(payload: VideoMultipartAbortRequest) -> Response:
    await run_in_threadpool(abort_multipart_upload, payload.key, payload.upload_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video_asset(
    exercise_id: str = Form(min_length=1, max_length=80),
    video_name: str = Form(min_length=1, max_length=160),
    video_description: str = Form(min_length=1, max_length=2000),
    thumbnail: UploadFile = File(),
    video_file: UploadFile | None = File(default=None),
    video_upload_key: str | None = Form(default=None),
    video_upload_id: str | None = Form(default=None),
    video_upload_parts: str | None = Form(default=None),
    video_file_name: str | None = Form(default=None),
    video_file_size: int | None = Form(default=None),
    duration_seconds: float | None = Form(default=None),
) -> VideoResponse:
    return VideoResponse(
        **(
            await create_video(
                exercise_id,
                video_name,
                video_description,
                thumbnail,
                video_file,
                video_upload_key,
                video_upload_id,
                _parse_completed_parts(video_upload_parts),
                video_file_name,
                video_file_size,
                duration_seconds,
            )
        )
    )


@router.get("", response_model=VideoListResponse)
async def get_video_list(
    search: str = Query(default="", max_length=160),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=1000),
) -> VideoListResponse:
    query = {}
    if search:
        query = {
            "$or": [
                {"video_name": {"$regex": search, "$options": "i"}},
                {"exercise_id": {"$regex": search, "$options": "i"}},
            ]
        }
    total = await db.videos.count_documents(query)
    items = [
        serialize_video(item)
        async for item in db.videos.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    ]
    return VideoListResponse(items=items, total=total)


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str) -> VideoResponse:
    from services.management_service import _object_id

    item = await db.videos.find_one({"_id": _object_id(video_id, "Video")})
    if not item:
        raise HTTPException(status_code=404, detail="Video not found")
    return VideoResponse(**serialize_video(item))


@router.put("/{video_id}", response_model=VideoResponse)
async def update_video_asset(
    video_id: str,
    exercise_id: str = Form(min_length=1, max_length=80),
    video_name: str = Form(min_length=1, max_length=160),
    video_description: str = Form(min_length=1, max_length=2000),
    thumbnail: UploadFile | None = File(default=None),
    video_file: UploadFile | None = File(default=None),
    video_upload_key: str | None = Form(default=None),
    video_upload_id: str | None = Form(default=None),
    video_upload_parts: str | None = Form(default=None),
    video_file_name: str | None = Form(default=None),
    video_file_size: int | None = Form(default=None),
    duration_seconds: float | None = Form(default=None),
) -> VideoResponse:
    return VideoResponse(
        **(
            await update_video(
                video_id,
                exercise_id,
                video_name,
                video_description,
                thumbnail,
                video_file,
                video_upload_key,
                video_upload_id,
                _parse_completed_parts(video_upload_parts),
                video_file_name,
                video_file_size,
                duration_seconds,
            )
        )
    )


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video_asset(video_id: str) -> Response:
    await delete_video(video_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
