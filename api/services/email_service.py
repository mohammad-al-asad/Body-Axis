import logging

import anyio
import resend
from fastapi import HTTPException, status

from core.config import settings

logger = logging.getLogger(__name__)


def _send_resend_email_sync(to_email: str, subject: str, html: str) -> dict:
    resend.api_key = settings.resend_api_key
    return resend.Emails.send(
        {
            "from": settings.resend_from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
    )


async def send_otp_email(to_email: str, otp_code: str, purpose: str) -> None:
    if not settings.resend_api_key:
        if settings.return_dev_otp and not purpose.startswith("admin_"):
            logger.info(
                "RESEND_API_KEY is not configured; skipping OTP email in dev mode."
            )
            return

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service is not configured",
        )

    subject = "Your Body Axis verification code"
    heading = "Verify your Body Axis email"
    intro = "Use this code to verify your email address."

    if purpose == "forgot_password":
        subject = "Reset your Body Axis password"
        heading = "Reset your Body Axis password"
        intro = "Use this code to reset your password."
    elif purpose == "admin_login_2fa":
        subject = "Your Body Axis admin verification code"
        heading = "Verify your admin login"
        intro = "Use this code to complete your Body Axis admin login."
    elif purpose == "admin_setup_2fa":
        subject = "Enable Body Axis admin two-factor authentication"
        heading = "Enable two-factor authentication"
        intro = "Use this code to enable two-factor authentication for your admin account."
    elif purpose == "admin_disable_2fa":
        subject = "Disable Body Axis admin two-factor authentication"
        heading = "Disable two-factor authentication"
        intro = "Use this code to disable two-factor authentication for your admin account."

    html = f"""
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">{heading}</h2>
      <p>{intro}</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">
        {otp_code}
      </div>
      <p>This code expires in {settings.otp_expire_minutes} minutes.</p>
      <p>If you did not request this code, you can safely ignore this email.</p>
    </div>
    """

    try:
        await anyio.to_thread.run_sync(
            _send_resend_email_sync,
            to_email,
            subject,
            html,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to send OTP email with Resend")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send OTP email",
        ) from exc
