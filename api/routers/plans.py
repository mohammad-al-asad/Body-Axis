from fastapi import APIRouter, HTTPException, Query, Response, status

from database import db
from schemas.management import PlanCreate, PlanListResponse, PlanResponse, PlanUpdate
from services.management_service import (
    create_plan,
    delete_plan,
    serialize_plan,
    update_plan,
)

router = APIRouter(prefix="/plans", tags=["Plan Management"])


@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan_item(payload: PlanCreate) -> PlanResponse:
    return await create_plan(payload)


@router.get("", response_model=PlanListResponse)
async def get_plan_list(
    search: str = Query(default="", max_length=160),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
) -> PlanListResponse:
    query = {}
    if search:
        query = {
            "$or": [
                {"plan_name": {"$regex": search, "$options": "i"}},
                {"plan_id": {"$regex": search, "$options": "i"}},
            ]
        }
    total = await db.plans.count_documents(query)
    items = [
        serialize_plan(item)
        async for item in db.plans.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    ]
    return PlanListResponse(items=items, total=total)


@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: str) -> PlanResponse:
    item = await db.plans.find_one({"plan_id": plan_id})
    if not item:
        raise HTTPException(status_code=404, detail="Plan not found")
    return PlanResponse(**serialize_plan(item))


@router.put("/{plan_id}", response_model=PlanResponse)
async def update_plan_item(plan_id: str, payload: PlanUpdate) -> PlanResponse:
    return await update_plan(plan_id, payload)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan_item(plan_id: str) -> Response:
    await delete_plan(plan_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
