from pydantic import BaseModel, Field


class PlatformVersionConfig(BaseModel):
    latest_version: str = Field(default="1.0.4", description="Latest released app version")
    minimum_version: str = Field(default="1.0.4", description="Minimum supported app version")
    force_update: bool = Field(default=False, description="Whether to block app usage until updated")
    title: str = Field(default="New Update Available 🎉", description="Update modal title")
    message: str = Field(
        default="A new version of Body Axis is available with performance improvements and new features.",
        description="Update modal message",
    )
    url: str = Field(description="App Store or Play Store URL")


class AppVersionConfig(BaseModel):
    ios: PlatformVersionConfig
    android: PlatformVersionConfig
