import logging
import math
from pathlib import Path
from typing import BinaryIO
from urllib.parse import quote
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, status

from core.config import settings

logger = logging.getLogger(__name__)
MULTIPART_PART_SIZE = 16 * 1024 * 1024
MULTIPART_URL_EXPIRATION_SECONDS = 60 * 60


def _client():
    if not settings.s3_bucket_name:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="S3_BUCKET_NAME is not configured",
        )

    client_kwargs = {
        "region_name": settings.aws_region,
        "endpoint_url": settings.s3_endpoint_url,
    }

    # Let boto3 fall back to the default credential chain so EC2 instance
    # roles work automatically when static keys are not provided.
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        client_kwargs["aws_access_key_id"] = settings.aws_access_key_id
        client_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
        if settings.aws_session_token:
            client_kwargs["aws_session_token"] = settings.aws_session_token

    return boto3.client("s3", **client_kwargs)


def _public_url(key: str) -> str:
    encoded_key = quote(key, safe="/")
    if settings.s3_public_base_url:
        return f"{settings.s3_public_base_url.rstrip('/')}/{encoded_key}"
    if settings.s3_endpoint_url:
        return (
            f"{settings.s3_endpoint_url.rstrip('/')}/"
            f"{settings.s3_bucket_name}/{encoded_key}"
        )
    if settings.aws_region == "us-east-1":
        return f"https://{settings.s3_bucket_name}.s3.amazonaws.com/{encoded_key}"
    return (
        f"https://{settings.s3_bucket_name}.s3."
        f"{settings.aws_region}.amazonaws.com/{encoded_key}"
    )


def upload_file(
    file_object: BinaryIO,
    original_name: str | None,
    content_type: str | None,
    folder: str,
) -> tuple[str, str]:
    suffix = Path(original_name or "").suffix.lower()
    key = f"exercise-videos/{folder}/{uuid4().hex}{suffix}"
    extra_args = {"ContentType": content_type or "application/octet-stream"}

    try:
        _client().upload_fileobj(
            file_object,
            settings.s3_bucket_name,
            key,
            ExtraArgs=extra_args,
        )
    except (BotoCoreError, ClientError) as exc:
        logger.exception(
            "S3 upload failed: bucket=%s key=%s content_type=%s",
            settings.s3_bucket_name,
            key,
            extra_args["ContentType"],
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to upload file to S3",
        ) from exc

    return _public_url(key), key


def create_multipart_upload(
    original_name: str,
    content_type: str,
    file_size: int,
    folder: str,
) -> dict[str, object]:
    if file_size <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File size must be greater than 0",
        )

    suffix = Path(original_name).suffix.lower()
    key = f"exercise-videos/{folder}/{uuid4().hex}{suffix}"
    client = _client()

    try:
        response = client.create_multipart_upload(
            Bucket=settings.s3_bucket_name,
            Key=key,
            ContentType=content_type or "application/octet-stream",
        )
    except (BotoCoreError, ClientError) as exc:
        logger.exception(
            "S3 multipart create failed: bucket=%s key=%s content_type=%s",
            settings.s3_bucket_name,
            key,
            content_type,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to initialize multipart upload",
        ) from exc

    upload_id = response["UploadId"]
    total_parts = math.ceil(file_size / MULTIPART_PART_SIZE)
    if total_parts > 10_000:
        abort_multipart_upload(key, upload_id)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File is too large for multipart upload",
        )

    parts = [
        {
            "part_number": part_number,
            "url": client.generate_presigned_url(
                "upload_part",
                Params={
                    "Bucket": settings.s3_bucket_name,
                    "Key": key,
                    "UploadId": upload_id,
                    "PartNumber": part_number,
                },
                ExpiresIn=MULTIPART_URL_EXPIRATION_SECONDS,
            ),
        }
        for part_number in range(1, total_parts + 1)
    ]

    return {
        "upload_id": upload_id,
        "key": key,
        "public_url": _public_url(key),
        "part_size": MULTIPART_PART_SIZE,
        "parts": parts,
    }


def complete_multipart_upload(
    key: str,
    upload_id: str,
    parts: list[dict[str, object]],
) -> tuple[str, str]:
    if not parts:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Multipart upload parts are required",
        )

    completed_parts = [
        {"ETag": str(part["etag"]), "PartNumber": int(part["part_number"])}
        for part in sorted(parts, key=lambda item: int(item["part_number"]))
    ]

    try:
        _client().complete_multipart_upload(
            Bucket=settings.s3_bucket_name,
            Key=key,
            UploadId=upload_id,
            MultipartUpload={"Parts": completed_parts},
        )
    except (BotoCoreError, ClientError) as exc:
        logger.exception(
            "S3 multipart complete failed: bucket=%s key=%s upload_id=%s",
            settings.s3_bucket_name,
            key,
            upload_id,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to finalize multipart upload",
        ) from exc

    return _public_url(key), key


def abort_multipart_upload(key: str, upload_id: str) -> None:
    if not key or not upload_id or not settings.s3_bucket_name:
        return
    try:
        _client().abort_multipart_upload(
            Bucket=settings.s3_bucket_name,
            Key=key,
            UploadId=upload_id,
        )
    except (BotoCoreError, ClientError):
        logger.exception(
            "S3 multipart abort failed: bucket=%s key=%s upload_id=%s",
            settings.s3_bucket_name,
            key,
            upload_id,
        )
        return


def delete_file(key: str | None) -> None:
    if not key or not settings.s3_bucket_name:
        return
    try:
        _client().delete_object(Bucket=settings.s3_bucket_name, Key=key)
    except (BotoCoreError, ClientError):
        logger.exception(
            "S3 delete failed: bucket=%s key=%s",
            settings.s3_bucket_name,
            key,
        )
        # Database deletion should not be blocked by an orphaned S3 object.
        return
