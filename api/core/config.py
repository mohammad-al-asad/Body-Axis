import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    api_prefix: str = os.getenv(
        "API_PREFIX",
        os.getenv("API_V1_PREFIX", "/api/v1"),
    )
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
    resend_api_key: str | None = os.getenv("RESEND_API_KEY")
    resend_from_email: str = os.getenv(
        "RESEND_FROM_EMAIL",
        "Body Axis <no-reply@example.com>",
    )

    admin_bootstrap_name: str | None = os.getenv("ADMIN_BOOTSTRAP_NAME")
    admin_bootstrap_email: str | None = os.getenv("ADMIN_BOOTSTRAP_EMAIL")
    admin_bootstrap_password: str | None = os.getenv("ADMIN_BOOTSTRAP_PASSWORD")

    google_client_id: str | None = os.getenv("GOOGLE_CLIENT_ID")
    apple_client_id: str | None = os.getenv("APPLE_CLIENT_ID")

    revenuecat_webhook_auth: str | None = os.getenv("REVENUECAT_WEBHOOK_AUTH")
    revenuecat_rest_api_key: str | None = os.getenv(
        "REVENUECAT_REST_API_KEY",
        os.getenv("REVENUECAT_SECRET_API_KEY"),
    )
    revenuecat_v2_api_key: str | None = os.getenv(
        "REVENUECAT_V2_API_KEY",
        os.getenv("REVENUECAT_SECRET_API_KEY_V2"),
    )
    revenuecat_project_id: str | None = os.getenv("REVENUECAT_PROJECT_ID")
    revenuecat_entitlement_id: str = os.getenv("REVENUECAT_ENTITLEMENT_ID", "premium")

    aws_access_key_id: str | None = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str | None = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_session_token: str | None = os.getenv("AWS_SESSION_TOKEN")
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    s3_bucket_name: str | None = os.getenv("S3_BUCKET_NAME")
    s3_public_base_url: str | None = os.getenv("S3_PUBLIC_BASE_URL")
    s3_endpoint_url: str | None = os.getenv("S3_ENDPOINT_URL")
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
