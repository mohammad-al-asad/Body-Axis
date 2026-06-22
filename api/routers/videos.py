from fastapi import APIRouter, File, Form, Query, Response, UploadFile, status

from database import db
from schemas.management import VideoListResponse, VideoResponse
from services.management_service import (
    create_video,
    delete_video,
    serialize_video,
    update_video,
)

router = APIRouter(prefix="/videos", tags=["Video Management"])


@router.post("", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video_asset(
    exercise_id: str = Form(min_length=1, max_length=80),
    video_name: str = Form(min_length=1, max_length=160),
    video_description: str = Form(min_length=1, max_length=2000),
    thumbnail: UploadFile = File(),
    video_file: UploadFile = File(),
) -> VideoResponse:
    return VideoResponse(
        **(
            await create_video(
                exercise_id,
                video_name,
                video_description,
                thumbnail,
                video_file,
            )
        )
    )


@router.get("", response_model=VideoListResponse)
async def get_video_list(
    search: str = Query(default="", max_length=160),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
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
        from fastapi import HTTPException

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
            )
        )
    )


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video_asset(video_id: str) -> Response:
    await delete_video(video_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
