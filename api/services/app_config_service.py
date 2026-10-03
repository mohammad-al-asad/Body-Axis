from datetime import datetime, timezone
from typing import Any

from database import db
from schemas.app_config import AppVersionConfig, PlatformVersionConfig

DEFAULT_APP_VERSION_CONFIG: dict[str, Any] = {
    "key": "app_version_config",
    "ios": {
        "latest_version": "1.0.4",
        "minimum_version": "1.0.4",
        "force_update": False,
        "title": "New Update Available 🎉",
        "message": "A new version of Body Axis is available with performance improvements and new features.",
        "url": "https://apps.apple.com/us/app/body-axis-move-better/id6761671211",
    },
    "android": {
        "latest_version": "1.0.4",
        "minimum_version": "1.0.4",
        "force_update": False,
        "title": "New Update Available 🎉",
        "message": "A new version of Body Axis is available with performance improvements and new features.",
        "url": "https://play.google.com/store/apps/details?id=com.jointhebodyinstitute.bodyaxis",
    },
}


async def ensure_app_config() -> None:
    """Seed app_version_config document into app_config collection if it doesn't already exist."""
    existing = await db.app_config.find_one({"key": "app_version_config"})
    if not existing:
        doc = dict(DEFAULT_APP_VERSION_CONFIG)
        doc["created_at"] = datetime.now(timezone.utc)
        doc["updated_at"] = datetime.now(timezone.utc)
        await db.app_config.insert_one(doc)
        print("Seeded app_version_config into database")


async def get_app_version_config() -> AppVersionConfig:
    doc = await db.app_config.find_one({"key": "app_version_config"})
    if not doc:
        return AppVersionConfig(
            ios=PlatformVersionConfig(**DEFAULT_APP_VERSION_CONFIG["ios"]),
            android=PlatformVersionConfig(**DEFAULT_APP_VERSION_CONFIG["android"]),
        )
    return AppVersionConfig(
        ios=PlatformVersionConfig(**doc.get("ios", DEFAULT_APP_VERSION_CONFIG["ios"])),
        android=PlatformVersionConfig(**doc.get("android", DEFAULT_APP_VERSION_CONFIG["android"])),
    )


async def update_app_version_config(payload: AppVersionConfig) -> AppVersionConfig:
    now = datetime.now(timezone.utc)
    update_data = {
        "ios": payload.ios.model_dump(),
        "android": payload.android.model_dump(),
        "updated_at": now,
    }
    await db.app_config.update_one(
        {"key": "app_version_config"},
        {"$set": update_data, "$setOnInsert": {"key": "app_version_config", "created_at": now}},
        upsert=True,
    )
    return payload
