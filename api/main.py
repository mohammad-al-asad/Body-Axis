from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI

from core.config import settings
from database import client, db
from routers import auth, revenuecat, subscription
from services.auth_service import ensure_auth_indexes
from services.subscription_service import ensure_subscription_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    await ensure_auth_indexes()
    await ensure_subscription_indexes()
    print("Connected to MongoDB")
    yield
    await client.close()


app = FastAPI(lifespan=lifespan)

api_router = APIRouter(prefix=settings.api_prefix)
api_router.include_router(auth.router)
api_router.include_router(subscription.router)
api_router.include_router(revenuecat.router)


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
