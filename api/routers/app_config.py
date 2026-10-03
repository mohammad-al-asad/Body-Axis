from typing import Any

from fastapi import APIRouter, Depends

from core.dependencies import get_current_admin
from schemas.app_config import AppVersionConfig
from services.app_config_service import get_app_version_config, update_app_version_config

router = APIRouter(prefix="/app", tags=["App Configuration"])


@router.get("/version-config", response_model=AppVersionConfig)
async def fetch_app_version_config() -> AppVersionConfig:
    """Public endpoint for mobile apps to fetch app update and version configs."""
    return await get_app_version_config()


@router.put("/version-config", response_model=AppVersionConfig)
async def modify_app_version_config(
    payload: AppVersionConfig,
    admin: dict[str, Any] = Depends(get_current_admin),
) -> AppVersionConfig:
    """Admin-only endpoint to update the app version config."""
    return await update_app_version_config(payload)
