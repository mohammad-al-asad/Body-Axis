from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from database import client, db
from routers import admin, auth, content, exercises, plans, revenuecat, sessions, sessions_v2, subscription, users, videos, notifications
from services.admin_service import ensure_admin_indexes
from services.auth_service import ensure_auth_indexes
from services.content_service import ensure_content_indexes
from services.management_service import ensure_management_indexes
from services.session_service import ensure_session_indexes
from services.subscription_service import ensure_subscription_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    await ensure_auth_indexes()
    await ensure_admin_indexes()
    await ensure_subscription_indexes()
    await ensure_management_indexes()
    await ensure_session_indexes()
    await ensure_content_indexes()
    print("Connected to MongoDB")

    # Seed initial notifications if collection is empty
    if await db.notifications.count_documents({}) == 0:
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        await db.notifications.insert_many([
            {
                "message": "A new user joined your app.",
                "type": "user_signup",
                "is_read": False,
                "created_at": now - timedelta(minutes=5),
            },
            {
                "message": "Profile report received.",
                "type": "profile_report",
                "is_read": False,
                "created_at": now - timedelta(hours=2),
            },
            {
                "message": "A new verification request.",
                "type": "verification",
                "is_read": True,
                "created_at": now - timedelta(days=1),
            },
            {
                "message": "New comment on your post.",
                "type": "comment",
                "is_read": True,
                "created_at": now - timedelta(days=2),
            },
        ])
        print("Seeded initial notifications")

    yield
    await client.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix=settings.api_prefix)
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(content.router)
api_router.include_router(subscription.router)
api_router.include_router(revenuecat.router)
api_router.include_router(users.router)
api_router.include_router(sessions.router)
api_router.include_router(videos.router)
api_router.include_router(exercises.router)
api_router.include_router(plans.router)
api_router.include_router(notifications.router)


@api_router.get("/health")
async def api_health_check():
    await db.command("ping")
    return {"database": "connected"}


app.include_router(api_router)

api_v2_router = APIRouter(prefix="/api/v2")
api_v2_router.include_router(auth.router)
api_v2_router.include_router(admin.router)
api_v2_router.include_router(content.router)
api_v2_router.include_router(subscription.router)
api_v2_router.include_router(revenuecat.router)
api_v2_router.include_router(users.router)
api_v2_router.include_router(sessions_v2.router)
api_v2_router.include_router(videos.router)
api_v2_router.include_router(exercises.router)
api_v2_router.include_router(plans.router)
api_v2_router.include_router(notifications.router)


@api_v2_router.get("/health")
async def api_v2_health_check():
    await db.command("ping")
    return {"database": "connected", "version": "v2"}


app.include_router(api_v2_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health")
async def health_check():
    await db.command("ping")
    return {"database": "connected"}

