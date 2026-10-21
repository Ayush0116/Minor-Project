
"""API routes for market-demand analysis."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .service import analyze_market_demand


router = APIRouter(
    prefix="/api/ai",
    tags=["Market Analysis"],
)


class MarketAnalysisRequest(BaseModel):
    targetRole: str | None = Field(default=None, max_length=120)
    target_role: str | None = Field(default=None, max_length=120)
    role: str | None = Field(default=None, max_length=120)


@router.post("/market-analysis")
async def market_analysis(request: MarketAnalysisRequest):
    """Return market-demand information for the requested career role."""

    target_role = (
        request.targetRole
        or request.target_role
        or request.role
        or ""
    ).strip()

    if not target_role:
        raise HTTPException(
            status_code=422,
            detail="targetRole is required.",
        )

    try:
        return analyze_market_demand(target_role)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to analyze market demand.",
        ) from exc
