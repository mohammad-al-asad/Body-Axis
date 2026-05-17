import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    api_prefix: str = os.getenv("API_PREFIX", "/api/v1")
    secret_key: str = os.getenv(
        "SECRET_KEY",
        "change-this-dev-secret-with-at-least-32-bytes",
    )
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")
    )
    otp_expire_minutes: int = int(os.getenv("OTP_EXPIRE_MINUTES", "10"))
    otp_length: int = 4
    return_dev_otp: bool = os.getenv("RETURN_DEV_OTP", "true").lower() == "true"

    google_client_id: str | None = os.getenv("GOOGLE_CLIENT_ID")
    apple_client_id: str | None = os.getenv("APPLE_CLIENT_ID")


settings = Settings()
