from pathlib import Path
from typing import BinaryIO
from urllib.parse import quote
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, status

from core.config import settings


def _client():
    if not settings.s3_bucket_name:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="S3_BUCKET_NAME is not configured",
        )

    return boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        aws_session_token=settings.aws_session_token,
        endpoint_url=settings.s3_endpoint_url,
    )


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
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to upload file to S3",
        ) from exc

    return _public_url(key), key


def delete_file(key: str | None) -> None:
    if not key or not settings.s3_bucket_name:
        return
    try:
        _client().delete_object(Bucket=settings.s3_bucket_name, Key=key)
    except (BotoCoreError, ClientError):
        # Database deletion should not be blocked by an orphaned S3 object.
        return
