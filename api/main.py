from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from database import client, db
from routers import admin, auth, exercises, plans, revenuecat, subscription, users, videos
from services.admin_service import ensure_admin_indexes
from services.auth_service import ensure_auth_indexes
from services.management_service import ensure_management_indexes
from services.subscription_service import ensure_subscription_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    await ensure_auth_indexes()
    await ensure_admin_indexes()
    await ensure_subscription_indexes()
    await ensure_management_indexes()
    print("Connected to MongoDB")
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
api_router.include_router(subscription.router)
api_router.include_router(revenuecat.router)
api_router.include_router(users.router)
api_router.include_router(videos.router)
api_router.include_router(exercises.router)
api_router.include_router(plans.router)


@api_router.get("/health")
async def api_health_check():
    await db.command("ping")
    return {"database": "connected"}


app.include_router(api_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health")
async def health_check():
    await db.command("ping")
    return {"database": "connected"}
