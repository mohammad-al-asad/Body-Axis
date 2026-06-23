import asyncio
from datetime import date, datetime, timezone
from typing import Any
from urllib.parse import quote

import httpx
from fastapi import HTTPException, status

from core.config import settings

REVENUECAT_V2_BASE = "https://api.revenuecat.com/v2"


class RevenueCatV2Error(Exception):
    def __init__(self, capability: str, status_code: int, message: str):
        super().__init__(message)
        self.capability = capability
        self.status_code = status_code
        self.message = message


def revenuecat_v2_configured() -> bool:
    return bool(settings.revenuecat_v2_api_key and settings.revenuecat_project_id)


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.revenuecat_v2_api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def _project_path(path: str) -> str:
    project_id = quote(settings.revenuecat_project_id or "", safe="")
    return f"/projects/{project_id}{path}"


async def _request(
    method: str,
    path: str,
    *,
    capability: str,
    params: dict[str, Any] | None = None,
    json: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not revenuecat_v2_configured():
        raise RevenueCatV2Error(
            capability,
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "RevenueCat V2 key and project ID are not configured",
        )

    url = path if path.startswith("http") else f"{REVENUECAT_V2_BASE}{path}"
    async with httpx.AsyncClient(timeout=25) as client:
        try:
            response = await client.request(
                method,
                url,
                headers=_headers(),
                params=params,
                json=json,
            )
        except httpx.HTTPError as exc:
            raise RevenueCatV2Error(
                capability,
                status.HTTP_502_BAD_GATEWAY,
                "RevenueCat could not be reached",
            ) from exc

    if response.status_code >= 400:
        try:
            body = response.json()
        except ValueError:
            body = {}
        message = body.get("message") if isinstance(body, dict) else None
        raise RevenueCatV2Error(
            capability,
            response.status_code,
            message or f"RevenueCat returned HTTP {response.status_code}",
        )

    if response.status_code == status.HTTP_204_NO_CONTENT:
        return {}
    try:
        body = response.json()
    except ValueError as exc:
        raise RevenueCatV2Error(
            capability,
            status.HTTP_502_BAD_GATEWAY,
            "RevenueCat returned an invalid JSON response",
        ) from exc
    return body if isinstance(body, dict) else {}


async def _list_all(
    path: str,
    *,
    capability: str,
    params: dict[str, Any] | None = None,
    maximum: int = 2000,
) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    next_path: str | None = path
    next_params = {"limit": 100, **(params or {})}

    while next_path and len(items) < maximum:
        page = await _request(
            "GET",
            next_path,
            capability=capability,
            params=next_params,
        )
        page_items = page.get("items")
        if isinstance(page_items, list):
            items.extend(item for item in page_items if isinstance(item, dict))
        next_page = page.get("next_page")
        next_path = (
            f"{REVENUECAT_V2_BASE}{next_page}"
            if isinstance(next_page, str) and next_page.startswith("/")
            else next_page if isinstance(next_page, str) else None
        )
        next_params = None

    return items[:maximum]


async def list_customers() -> list[dict[str, Any]]:
    return await _list_all(
        _project_path("/customers"),
        capability="customers",
    )


async def list_customer_subscriptions(
    customer_id: str,
) -> list[dict[str, Any]]:
    encoded_customer_id = quote(customer_id, safe="")
    return await _list_all(
        _project_path(f"/customers/{encoded_customer_id}/subscriptions"),
        capability="customer_subscriptions",
    )


async def list_all_customer_subscriptions(
    customers: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    semaphore = asyncio.Semaphore(8)

    async def fetch(customer: dict[str, Any]):
        customer_id = str(customer.get("id") or "")
        if not customer_id:
            return customer_id, []
        async with semaphore:
            return customer_id, await list_customer_subscriptions(customer_id)

    results = await asyncio.gather(*(fetch(customer) for customer in customers))
    return dict(results)


async def list_products() -> list[dict[str, Any]]:
    return await _list_all(
        _project_path("/products"),
        capability="products",
    )


async def list_entitlements() -> list[dict[str, Any]]:
    return await _list_all(
        _project_path("/entitlements"),
        capability="entitlements",
    )


async def get_overview_metrics() -> dict[str, Any]:
    return await _request(
        "GET",
        _project_path("/metrics/overview"),
        capability="overview_metrics",
    )


async def get_revenue(
    start_date: date,
    end_date: date,
    currency: str = "USD",
) -> float:
    body = await _request(
        "GET",
        _project_path("/metrics/revenue"),
        capability="revenue_metrics",
        params={
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "currency": currency,
            "revenue_type": "revenue",
        },
    )
    try:
        return float(body.get("value") or 0)
    except (TypeError, ValueError):
        return 0.0


async def grant_entitlement(
    customer_id: str,
    entitlement_id: str,
    expires_at: datetime,
) -> None:
    encoded_customer_id = quote(customer_id, safe="")
    await _request(
        "POST",
        _project_path(
            f"/customers/{encoded_customer_id}/actions/grant_entitlement"
        ),
        capability="grant_entitlement",
        json={
            "entitlement_id": entitlement_id,
            "expires_at": int(expires_at.timestamp() * 1000),
        },
    )


async def revoke_granted_entitlement(
    customer_id: str,
    entitlement_id: str,
) -> None:
    encoded_customer_id = quote(customer_id, safe="")
    await _request(
        "POST",
        _project_path(
            f"/customers/{encoded_customer_id}/actions/revoke_granted_entitlement"
        ),
        capability="revoke_entitlement",
        json={"entitlement_id": entitlement_id},
    )


def as_http_exception(error: RevenueCatV2Error) -> HTTPException:
    if error.status_code in {
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_404_NOT_FOUND,
        status.HTTP_409_CONFLICT,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
    }:
        response_status = error.status_code
    elif error.status_code in {
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    }:
        response_status = status.HTTP_502_BAD_GATEWAY
    else:
        response_status = status.HTTP_502_BAD_GATEWAY
    return HTTPException(
        status_code=response_status,
        detail=f"RevenueCat {error.capability}: {error.message}",
    )
