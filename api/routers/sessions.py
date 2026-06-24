from fastapi import APIRouter, Depends, status

from core.dependencies import get_current_user
from schemas.sessions import (
    MovementSessionListResponse,
    MovementSessionResponse,
    SessionCreateRequest,
)
from services.session_service import (
    create_user_session,
    get_user_session,
    list_user_sessions,
)

router = APIRouter(prefix="/sessions", tags=["Movement Sessions"])


@router.post("", response_model=MovementSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreateRequest,
    current_user: dict = Depends(get_current_user),
) -> MovementSessionResponse:
    return await create_user_session(current_user, payload)


@router.get("", response_model=MovementSessionListResponse)
async def get_sessions(
    current_user: dict = Depends(get_current_user),
) -> MovementSessionListResponse:
    return await list_user_sessions(current_user)


@router.get("/{session_id}", response_model=MovementSessionResponse)
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
) -> MovementSessionResponse:
    return await get_user_session(current_user, session_id)
