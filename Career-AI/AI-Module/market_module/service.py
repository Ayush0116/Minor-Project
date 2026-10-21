
"""Business logic for market-demand analysis."""

from typing import Any


# These are illustrative estimates, not verified live-market statistics.
# Replace them with sourced market data before presenting them as real figures.
ROLE_MARKET_DATA: dict[str, dict[str, Any]] = {
    "software developer": {
        "display_role": "Software Developer",
        "demand_level": "High",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 60},
            {"month": "Jun", "value": 63},
            {"month": "Jul", "value": 65},
            {"month": "Aug", "value": 67},
            {"month": "Sep", "value": 69},
            {"month": "Oct", "value": 71},
        ],
    },
    "full stack developer": {
        "display_role": "Full Stack Developer",
        "demand_level": "High",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 58},
            {"month": "Jun", "value": 61},
            {"month": "Jul", "value": 64},
            {"month": "Aug", "value": 66},
            {"month": "Sep", "value": 68},
            {"month": "Oct", "value": 70},
        ],
    },
    "frontend developer": {
        "display_role": "Frontend Developer",
        "demand_level": "Moderate",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 54},
            {"month": "Jun", "value": 56},
            {"month": "Jul", "value": 57},
            {"month": "Aug", "value": 59},
            {"month": "Sep", "value": 60},
            {"month": "Oct", "value": 62},
        ],
    },
    "backend developer": {
        "display_role": "Backend Developer",
        "demand_level": "High",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 57},
            {"month": "Jun", "value": 60},
            {"month": "Jul", "value": 63},
            {"month": "Aug", "value": 65},
            {"month": "Sep", "value": 68},
            {"month": "Oct", "value": 70},
        ],
    },
    "data analyst": {
        "display_role": "Data Analyst",
        "demand_level": "Moderate",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 52},
            {"month": "Jun", "value": 55},
            {"month": "Jul", "value": 57},
            {"month": "Aug", "value": 59},
            {"month": "Sep", "value": 62},
            {"month": "Oct", "value": 64},
        ],
    },
    "data scientist": {
        "display_role": "Data Scientist",
        "demand_level": "High",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 60},
            {"month": "Jun", "value": 62},
            {"month": "Jul", "value": 65},
            {"month": "Aug", "value": 68},
            {"month": "Sep", "value": 70},
            {"month": "Oct", "value": 73},
        ],
    },
    "financial analyst": {
        "display_role": "Financial Analyst",
        "demand_level": "Moderate",
        "trend": "Stable",
        "source_type": "illustrative_estimate",
        "monthly_demand": [
            {"month": "May", "value": 50},
            {"month": "Jun", "value": 53},
            {"month": "Jul", "value": 55},
            {"month": "Aug", "value": 57},
            {"month": "Sep", "value": 59},
            {"month": "Oct", "value": 61},
        ],
    },
}


def analyze_market_demand(target_role: str) -> dict[str, Any]:
    """Return role-specific market-demand data for dashboard charts."""

    role = " ".join((target_role or "").strip().lower().split())

    if not role:
        raise ValueError("targetRole is required.")

    market = ROLE_MARKET_DATA.get(role)

    if market is None:
        # Do not silently assign another role's demand data.
        return {
            "success": True,
            "targetRole": target_role.strip(),
            "displayRole": target_role.strip(),
            "available": False,
            "message": (
                "Market-demand data is not available for this role yet."
            ),
            "sourceType": "unavailable",
            "demandLevel": None,
            "trend": None,
            "monthlyDemand": [],
        }

    return {
        "success": True,
        "targetRole": target_role.strip(),
        "displayRole": market["display_role"],
        "available": True,
        "sourceType": market["source_type"],
        "demandLevel": market["demand_level"],
        "trend": market["trend"],
        "monthlyDemand": [
            {"month": item["month"], "value": item["value"]}
            for item in market["monthly_demand"]
        ],
        "disclaimer": (
            "Illustrative estimates only; not verified live-market data."
        ),
    }
