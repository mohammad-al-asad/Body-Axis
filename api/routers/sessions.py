from fastapi import APIRouter, Depends, status

from core.dependencies import get_current_user
from schemas.sessions import (
    MovementSessionListResponse,
    MovementSessionResponse,
    ProgressSummaryResponse,
    SessionExerciseCompleteRequest,
    SessionCreateRequest,
)
from services.session_service import (
    complete_session_exercise,
    create_user_session,
    get_user_session,
    get_user_progress_summary,
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


@router.get("/summary/me", response_model=ProgressSummaryResponse)
async def get_progress_summary(
    current_user: dict = Depends(get_current_user),
) -> ProgressSummaryResponse:
    return await get_user_progress_summary(current_user)


@router.post("/{session_id}/exercises/{exercise_id}/complete", response_model=MovementSessionResponse)
async def complete_exercise(
    session_id: str,
    exercise_id: str,
    payload: SessionExerciseCompleteRequest,
    current_user: dict = Depends(get_current_user),
) -> MovementSessionResponse:
    return await complete_session_exercise(current_user, session_id, exercise_id, payload)


@router.get("/{session_id}", response_model=MovementSessionResponse)
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
) -> MovementSessionResponse:
    return await get_user_session(current_user, session_id)
