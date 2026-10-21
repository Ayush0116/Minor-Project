
import os
import json
import re
from urllib.parse import quote_plus
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from chatbot_module import router as chatbot_router
from resume_module import router as resume_router
from openai import (
    AsyncOpenAI,
    APIStatusError,
    APITimeoutError,
    APIConnectionError,
)
from pydantic import BaseModel, Field

from career_catalog import CAREER_CATALOG
from skill_catalog import SKILL_CATALOG, GENERIC_TEMPLATES

from chatbot_module import router as chatbot_router
from market_module import router as market_router


# =========================================================
# 1. CONFIGURATION
# =========================================================

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
BASE_URL = os.getenv(
    "OPENROUTER_BASE_URL",
    "https://openrouter.ai/api/v1",
).strip()
MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "nvidia/nemotron-3.5-super-vl:free",
).strip()

client = AsyncOpenAI(
    api_key=API_KEY or "missing-api-key",
    base_url=BASE_URL,
    timeout=90.0,
    max_retries=0,
)

app = FastAPI(
    title="Career Curator AI",
    description=(
        "Universal career profiles, skill analysis and roadmap generation"
    ),
    version="5.0.0",
)

# Register existing routers; keep both modules enabled.
app.include_router(chatbot_router)
app.include_router(market_router)
app.include_router(resume_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# 2. REQUEST MODELS
# =========================================================

class CareerProfile(BaseModel):
    degree: str = Field(min_length=1, max_length=120)
    field: str = Field(min_length=1, max_length=150)
    targetRole: str = Field(min_length=1, max_length=150)
    timelineMonths: int = Field(ge=1, le=120)
    interests: list[str] = Field(default_factory=list, max_length=30)
    knownSkills: list[str] = Field(default_factory=list, max_length=100)


class SkillPlanRequest(CareerProfile):
    roleId: str = Field(min_length=1, max_length=150)


class AssessmentGenerateRequest(BaseModel):
    degree: str = Field(default="Not specified", max_length=120)
    field: str = Field(default="Not specified", max_length=150)
    roleId: str = Field(default="", max_length=150)
    role: str = Field(min_length=1, max_length=150)
    skillId: str = Field(default="", max_length=150)
    skill: str = Field(min_length=1, max_length=150)
    skillDescription: str = Field(default="", max_length=1000)
    assessmentType: str = Field(min_length=1, max_length=80)
    difficulty: str = Field(default="beginner", max_length=40)
    language: str = Field(default="English", max_length=60)
    count: int = Field(default=3, ge=1, le=5)
    additionalInstructions: str = Field(default="", max_length=1000)


# =========================================================
# 3. GENERAL HELPERS
# =========================================================

def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    return re.sub(
        r"[^a-z0-9+#.]+",
        " ",
        str(value).casefold(),
    ).strip()


def extract_json(raw: str) -> dict[str, Any]:
    if not isinstance(raw, str) or not raw.strip():
        raise ValueError("Empty AI response.")

    cleaned = raw.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start < 0 or end <= start:
            raise ValueError("No complete JSON object.")

        result = json.loads(cleaned[start:end + 1])

    if not isinstance(result, dict):
        raise ValueError("Expected a JSON object.")

    return result


def get_message_text(message: Any) -> str:
    content = getattr(message, "content", None)

    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        parts = []

        for item in content:
            if isinstance(item, dict):
                value = item.get("text")
            else:
                value = getattr(item, "text", None)

            if isinstance(value, str) and value.strip():
                parts.append(value)

        return "\n".join(parts).strip()

    return ""


def ensure_api_key() -> None:
    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY is missing from .env.",
        )


def youtube_search(skill_name: str) -> str:
    query = quote_plus(f"{skill_name} tutorial for beginners")
    return f"https://www.youtube.com/results?search_query={query}"


# =========================================================
# 4. OPENROUTER HELPER
# Used only for profile analysis and role discovery.
# Roadmap endpoints do not call the AI provider.
# =========================================================

async def call_ai(
    system_prompt: str,
    user_data: dict[str, Any],
    max_tokens: int = 1000,
) -> dict[str, Any]:
    ensure_api_key()

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        system_prompt
                        + "\nReturn exactly one valid JSON object."
                        + "\nDo not use Markdown fences."
                        + "\nKeep the response concise and complete."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        user_data,
                        ensure_ascii=False,
                    ),
                },
            ],
            temperature=0.1,
            max_tokens=max_tokens,
        )

        if not response.choices:
            raise HTTPException(
                status_code=502,
                detail="AI provider returned no response choices.",
            )

        choice = response.choices[0]
        content = get_message_text(choice.message)

        print(
            "[AI DEBUG]",
            {
                "model": response.model,
                "finish_reason": choice.finish_reason,
                "content_length": len(content),
            },
        )

        if choice.finish_reason == "length":
            raise HTTPException(
                status_code=502,
                detail="AI output was truncated. Retry with a shorter request.",
            )

        if not content:
            raise HTTPException(
                status_code=502,
                detail="AI provider returned empty content.",
            )

        try:
            return extract_json(content)
        except (ValueError, json.JSONDecodeError) as exc:
            print("[AI JSON ERROR]", repr(content[:400]))
            raise HTTPException(
                status_code=502,
                detail="AI returned invalid JSON. Please retry.",
            ) from exc

    except HTTPException:
        raise

    except APIStatusError as exc:
        if exc.status_code == 429:
            detail = "AI rate limit reached. Wait before retrying."
        elif exc.status_code in (401, 403):
            detail = "AI provider rejected the key or denied model access."
        elif exc.status_code == 402:
            detail = "AI provider reports insufficient credits or quota."
        else:
            detail = f"AI provider returned status {exc.status_code}."

        raise HTTPException(status_code=502, detail=detail) from exc

    except APITimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail="AI request timed out.",
        ) from exc

    except APIConnectionError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to the AI provider.",
        ) from exc

    except Exception as exc:
        print("[AI PROVIDER ERROR]", type(exc).__name__)
        raise HTTPException(
            status_code=502,
            detail="Unexpected AI provider error.",
        ) from exc


# =========================================================
# 5. CAREER CATALOG
# =========================================================

def get_available_roles() -> list[dict[str, Any]]:
    roles = []
    seen = set()

    if isinstance(CAREER_CATALOG, list):
        groups = [("", CAREER_CATALOG)]
    elif isinstance(CAREER_CATALOG, dict):
        groups = list(CAREER_CATALOG.items())
    else:
        groups = []

    for category_id, entries in groups:
        if isinstance(entries, dict):
            entries = entries.get(
                "roles",
                entries.get("careers", []),
            )

        if not isinstance(entries, list):
            continue

        for item in entries:
            if not isinstance(item, dict):
                continue

            role_id = item.get("id") or item.get("roleId")
            name = item.get("name") or item.get("title")

            if not role_id or not name:
                continue

            role_id = str(role_id).strip()
            normalized_id = role_id.lower()

            if normalized_id in seen:
                continue

            seen.add(normalized_id)

            roles.append({
                "id": role_id,
                "name": str(name),
                "category": str(item.get("category", category_id)),
            })

    return roles


def resolve_role(
    role_id: str,
    target_role: str,
) -> dict[str, Any]:
    roles = get_available_roles()
    wanted_id = normalize_text(role_id)
    wanted_name = normalize_text(target_role)

    for role in roles:
        if normalize_text(role["id"]) == wanted_id:
            return role

    for role in roles:
        if normalize_text(role["name"]) == wanted_name:
            return role

    # Unknown but explicitly supplied roles can still receive
    # a clearly labelled generic starter plan.
    if target_role.strip():
        return {
            "id": role_id.strip() or "custom_role",
            "name": target_role.strip(),
            "category": "other",
        }

    raise HTTPException(
        status_code=404,
        detail="No matching career role was provided.",
    )


# =========================================================
# 6. SKILL CATALOG ADAPTER
# =========================================================

# Categories without a dedicated template use the general
# starter plan. Curated roles always use their own skill list.
CATEGORY_TEMPLATE_MAP = {
    "technology": "technology",
    "engineering": "general",
    "data_and_analytics": "data_and_analytics",
    "science_and_research": "general",
    "business_and_management": "business_and_management",
    "finance_and_accounting": "finance_and_accounting",
    "commerce": "business_and_management",
    "arts_and_humanities": "general",
    "design_and_creative": "design_and_creative",
    "healthcare_and_life_sciences": "general",
    "law_and_public_policy": "general",
    "education": "general",
    "agriculture_and_environment": "general",
    "media_and_communication": "general",
    "hospitality_and_tourism": "business_and_management",
    "other": "general",
}


def get_role_skill_record(role_id: str) -> Any:
    if isinstance(SKILL_CATALOG, dict):
        return SKILL_CATALOG.get(role_id)

    if isinstance(SKILL_CATALOG, list):
        for item in SKILL_CATALOG:
            if not isinstance(item, dict):
                continue

            item_id = item.get("id") or item.get("roleId")

            if str(item_id or "").lower() == role_id.lower():
                return item

    return None


def normalize_skill_list(raw_skills: Any) -> list[dict[str, Any]]:
    if not isinstance(raw_skills, list):
        return []

    result = []
    seen = set()

    for raw in raw_skills:
        if not isinstance(raw, dict):
            continue

        skill_id = raw.get("id") or raw.get("skillId")
        name = raw.get("name") or raw.get("title")

        if not skill_id or not name:
            continue

        skill_id = str(skill_id).strip()
        key = skill_id.lower()

        if key in seen:
            continue

        seen.add(key)

        aliases = raw.get("aliases", [])
        if not isinstance(aliases, list):
            aliases = []

        prerequisites = raw.get("prerequisites", [])
        if not isinstance(prerequisites, list):
            prerequisites = []

        try:
            hours = max(1, int(raw.get("hours", raw.get("estimatedHours", 10))))
        except (TypeError, ValueError):
            hours = 10

        try:
            order = int(raw.get("order", 999))
        except (TypeError, ValueError):
            order = 999

        skill = dict(raw)
        skill.update({
            "id": skill_id,
            "name": str(name),
            "hours": hours,
            "order": order,
            "aliases": aliases,
            "prerequisites": [str(x) for x in prerequisites],
            "category": str(raw.get("category", "Core")),
            "description": str(
                raw.get("description")
                or raw.get("definition")
                or f"Learn and practise {name} for your target career."
            ),
            "youtubeUrl": (
                raw.get("youtubeUrl")
                or raw.get("youtubeLink")
                or youtube_search(str(name))
            ),
        })

        result.append(skill)

    return result


def get_role_skills(
    role: dict[str, Any],
) -> tuple[list[dict[str, Any]], bool]:
    """
    Returns (skills, is_curated).

    Curated roles use their specific catalog.
    Other roles use a category-based starter template.
    """

    role_id = role["id"]
    record = get_role_skill_record(role_id)

    if isinstance(record, dict):
        raw_skills = record.get("skills", [])
    elif isinstance(record, list):
        raw_skills = record
    else:
        raw_skills = []

    curated_skills = normalize_skill_list(raw_skills)

    if curated_skills:
        return curated_skills, True

    category = role.get("category", "other")
    template_key = CATEGORY_TEMPLATE_MAP.get(
        category,
        "general",
    )

    template = GENERIC_TEMPLATES.get(
        template_key,
        GENERIC_TEMPLATES.get("general", []),
    )

    fallback_skills = normalize_skill_list(template)

    # Mark generic descriptions as starter guidance, rather than
    # pretending this is a fully researched role-specific curriculum.
    for item in fallback_skills:
        item["description"] = (
            f"Starter learning goal for {role['name']}: "
            f"learn and practise {item['name']}."
        )

    return fallback_skills, False


# =========================================================
# 7. SKILL MATCHING AND ORDERING
# =========================================================

def match_known_skills(
    known_skills: list[str],
    skills: list[dict[str, Any]],
) -> set[str]:
    known = {
        normalize_text(value)
        for value in known_skills
        if normalize_text(value)
    }

    matched = set()

    for skill in skills:
        candidates = [
            skill["id"],
            skill["name"],
            *skill.get("aliases", []),
        ]

        if any(
            normalize_text(candidate) in known
            for candidate in candidates
        ):
            matched.add(skill["id"])

    return matched


def order_skills(
    skills: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Topological ordering: prerequisites come before dependent skills.
    Configured order breaks ties. Cycles are handled safely.
    """

    def sort_key(item: dict[str, Any]):
        return (
            item.get("order", 999),
            item["id"].lower(),
        )

    remaining = sorted(list(skills), key=sort_key)
    ordered = []
    completed = set()

    existing_ids = {
        item["id"].lower()
        for item in remaining
    }

    while remaining:
        ready = []

        for item in remaining:
            dependencies = {
                str(dep).strip().lower()
                for dep in item.get("prerequisites", [])
            }

            # Ignore prerequisite IDs absent from this skill list.
            dependencies &= existing_ids

            if dependencies.issubset(completed):
                ready.append(item)

        if not ready:
            # Break a circular dependency without hanging the API.
            ready = [remaining[0]]

        for item in ready:
            if item in remaining:
                remaining.remove(item)

            ordered.append(item)
            completed.add(item["id"].lower())

    return ordered


def public_skill(skill: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": skill["id"],
        "name": skill["name"],
        "description": skill["description"],
        "category": skill["category"],
        "estimatedHours": skill["hours"],
        "youtubeUrl": skill["youtubeUrl"],
        "order": skill["order"],
        "prerequisites": skill["prerequisites"],
    }


def get_plan(
    request: SkillPlanRequest,
) -> tuple[dict[str, Any], list[dict[str, Any]], set[str], bool]:
    role = resolve_role(request.roleId, request.targetRole)
    skills, curated = get_role_skills(role)

    if not skills:
        raise HTTPException(
            status_code=500,
            detail="No skills or fallback template are available.",
        )

    ordered = order_skills(skills)
    known_ids = match_known_skills(request.knownSkills, ordered)

    return role, ordered, known_ids, curated


# =========================================================
# 8. HOME AND HEALTH
# =========================================================

@app.get("/")
async def home():
    return {
        "success": True,
        "service": "Career Curator AI",
        "version": "5.0.0",
        "model": MODEL,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    curated_count = 0

    for role_id in get_available_roles():
        record = get_role_skill_record(role_id["id"])

        if isinstance(record, list) and record:
            curated_count += 1
        elif isinstance(record, dict) and record.get("skills"):
            curated_count += 1

    return {
        "success": True,
        "service": "Career Curator AI",
        "version": "5.0.0",
        "model": MODEL,
        "apiKeyConfigured": bool(API_KEY),
        "availableRoles": len(get_available_roles()),
        "rolesWithCuratedSkills": curated_count,
        "genericFallbackEnabled": True,
    }


# =========================================================
# 9. PROFILE ANALYSIS
# POST /api/ai/profile-analysis
# =========================================================

@app.post("/api/ai/profile-analysis")
async def profile_analysis(profile: CareerProfile):
    result = await call_ai(
        system_prompt=(
            "You are a practical career counselor. "
            "Analyze the supplied education, interests, skills and goal. "
            "Return careerCategory, timelineCategory, profileCompleteness, "
            "reasoning and suggestions. profileCompleteness must be 0-100. "
            "Suggestions must be short strings."
        ),
        user_data={"profile": profile.model_dump()},
        max_tokens=700,
    )

    try:
        completeness = int(result.get("profileCompleteness", 0))
    except (TypeError, ValueError):
        completeness = 0

    suggestions = result.get("suggestions", [])

    if not isinstance(suggestions, list):
        suggestions = []

    return {
        "success": True,
        "provider": "OpenRouter",
        "model": MODEL,
        "analysis": {
            **result,
            "profileCompleteness": max(0, min(100, completeness)),
            "suggestions": suggestions[:8],
        },
    }


# =========================================================
# 10. ROLE DISCOVERY
# POST /api/ai/role-discovery
# =========================================================

@app.post("/api/ai/role-discovery")
async def role_discovery(profile: CareerProfile):
    roles = get_available_roles()

    if not roles:
        raise HTTPException(
            status_code=500,
            detail="CAREER_CATALOG contains no valid roles.",
        )

    result = await call_ai(
        system_prompt=(
            "Recommend the best matching role from the supplied catalog. "
            "Never invent a role ID. Return recommendedRole with id and name, "
            "reasoning, and additionalSuggestions as an array of role IDs. "
            "Keep reasoning to two sentences."
        ),
        user_data={
            "profile": profile.model_dump(),
            "availableRoles": roles,
        },
        max_tokens=900,
    )

    valid_roles = {
        role["id"].lower(): role
        for role in roles
    }

    recommendation = result.get("recommendedRole", {})
    selected_id = ""

    if isinstance(recommendation, dict):
        selected_id = str(recommendation.get("id", "")).lower()

    selected_role = valid_roles.get(selected_id)

    # If the model's ID is invalid, try the user's exact target role.
    if selected_role is None:
        target = normalize_text(profile.targetRole)

        selected_role = next(
            (
                role for role in roles
                if normalize_text(role["name"]) == target
                or normalize_text(role["id"]) == target
            ),
            None,
        )

    if selected_role is None:
        raise HTTPException(
            status_code=502,
            detail="No valid role recommendation could be resolved.",
        )

    raw_suggestions = result.get("additionalSuggestions", [])
    if not isinstance(raw_suggestions, list):
        raw_suggestions = []

    suggestions = []

    for item in raw_suggestions:
        item_id = (
            str(item.get("id", "")).lower()
            if isinstance(item, dict)
            else str(item).lower()
        )

        if (
            item_id in valid_roles
            and item_id != selected_role["id"].lower()
            and item_id not in suggestions
        ):
            suggestions.append(item_id)

    return {
        "success": True,
        "provider": "OpenRouter",
        "model": MODEL,
        "recommendedRole": selected_role,
        "reasoning": str(result.get("reasoning", "")),
        "additionalSuggestions": suggestions[:5],
        "availableRoles": roles,
    }


# =========================================================
# 11. SKILL ANALYSIS
# POST /api/ai/skill-analysis
# No AI API call.
# =========================================================

@app.post("/api/ai/skill-analysis")
async def skill_analysis(request: SkillPlanRequest):
    role, ordered, known_ids, curated = get_plan(request)

    output = []

    # Find the first skill that the learner has not completed.
    first_missing_id = next(
        (
            item["id"]
            for item in ordered
            if item["id"] not in known_ids
        ),
        None,
    )

    for index, skill in enumerate(ordered, start=1):
        item = public_skill(skill)
        known = skill["id"] in known_ids

        if known:
            status = "Completed"
            priority = "Completed"
        elif skill["id"] == first_missing_id:
            status = "Active"
            priority = "High"
        else:
            status = "Pending"
            priority = "Medium"

        output.append({
            **item,
            "order": index,
            "known": known,
            "status": status,
            "priority": priority,
        })

    total = len(output)
    known_count = len(known_ids)
    remaining_hours = sum(
        item["estimatedHours"]
        for item in output
        if not item["known"]
    )
    total_hours = sum(
        item["estimatedHours"]
        for item in output
    )

    return {
        "success": True,
        "provider": "Backend Rule Engine",
        "model": None,
        "roleId": role["id"],
        "targetRole": role["name"],
        "category": role["category"],
        "planType": "curated" if curated else "generic_starter",
        "summary": {
            "totalSkills": total,
            "knownSkills": known_count,
            "missingSkills": total - known_count,
            "readinessPercentage": (
                round(known_count / total * 100)
                if total else 0
            ),
            "totalEstimatedHours": total_hours,
            "estimatedRemainingHours": remaining_hours,
            "timelineMonths": request.timelineMonths,
        },
        "knownSkillIds": sorted(known_ids),
        "skills": output,
        "reasoning": (
            "Skill ordering, prerequisites, readiness and estimated hours "
            "are computed by backend rules."
        ),
        "note": (
            "This is a curated role plan."
            if curated
            else (
                "This is a generic starter plan. Refine the skills for "
                "the selected role before treating it as a final curriculum."
            )
        ),
    }


# =========================================================
# 12. ROADMAP GENERATION
# POST /api/ai/roadmap
# No AI API call.
# =========================================================

@app.post("/api/ai/roadmap")
async def generate_roadmap(request: SkillPlanRequest):
    role, ordered, known_ids, curated = get_plan(request)

    missing = [
        skill for skill in ordered
        if skill["id"] not in known_ids
    ]

    total = len(ordered)
    known_count = len(known_ids)
    months = request.timelineMonths

    total_hours = sum(
        skill["hours"]
        for skill in ordered
    )

    remaining_hours = sum(
        skill["hours"]
        for skill in missing
    )

    roadmap = []

    for index, skill in enumerate(missing):
        item = public_skill(skill)

        # Spread missing skills across the requested timeline.
        if missing:
            month_number = (
                index * months // len(missing)
            ) + 1
        else:
            month_number = 1

        month_number = min(months, month_number)

        roadmap.append({
            "skillId": item["id"],
            "skillName": item["name"],
            "description": item["description"],
            "category": item["category"],
            "youtubeUrl": item["youtubeUrl"],
            "month": month_number,
            "status": "Active" if index == 0 else "Pending",
            "priority": "High" if index < 3 else "Medium",
            "estimatedHours": item["estimatedHours"],
            "prerequisites": item["prerequisites"],
            "weeks": [
                {
                    "week": 1,
                    "focus": f"Learn the fundamentals of {item['name']}.",
                },
                {
                    "week": 2,
                    "focus": f"Practise the core concepts of {item['name']}.",
                },
                {
                    "week": 3,
                    "focus": (
                        f"Complete a practical task using {item['name']}."
                    ),
                },
                {
                    "week": 4,
                    "focus": (
                        f"Revise and assess your {item['name']} knowledge."
                    ),
                },
            ],
        })

    public_skills = []

    first_missing_id = (
        missing[0]["id"]
        if missing else None
    )

    for index, skill in enumerate(ordered, start=1):
        item = public_skill(skill)
        known = skill["id"] in known_ids

        item["order"] = index
        item["known"] = known

        if known:
            item["status"] = "Completed"
        elif skill["id"] == first_missing_id:
            item["status"] = "Active"
        else:
            item["status"] = "Pending"

        public_skills.append(item)

    return {
        "success": True,
        "provider": "Backend Rule Engine",
        "model": None,
        "roleId": role["id"],
        "targetRole": role["name"],
        "category": role["category"],
        "planType": "curated" if curated else "generic_starter",
        "timelineMonths": months,
        "summary": {
            "totalSkills": total,
            "knownSkills": known_count,
            "missingSkills": len(missing),
            "readinessPercentage": (
                round(known_count / total * 100)
                if total else 0
            ),
            "totalEstimatedHours": total_hours,
            "estimatedRemainingHours": remaining_hours,
            "suggestedMonthlyHours": (
                (remaining_hours + months - 1) // months
                if remaining_hours else 0
            ),
        },
        "knownSkillIds": sorted(known_ids),
        "skills": public_skills,
        "roadmap": roadmap,
        "finalProject": None,
        "advice": [],
        "reasoning": (
            "Skill ordering, readiness, prerequisites and estimated hours "
            "are calculated by deterministic backend rules."
        ),
        "note": (
            "Curated skill plan."
            if curated
            else (
                "Generic starter roadmap. Its skills are not yet a "
                "verified role-specific curriculum."
            )
        ),
    }


# =========================================================
# 13. ASSESSMENT ENDPOINT
# Temporarily paused, as requested.
# =========================================================

@app.post("/api/ai/assessment/generate")
async def generate_assessment(
    request: AssessmentGenerateRequest,
):
    raise HTTPException(
        status_code=503,
        detail=(
            "Assessment generation is temporarily paused. "
            "Career analysis and roadmap endpoints remain available."
        ),
    )


# =========================================================
# 14. LOCAL SERVER ENTRY POINT
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
