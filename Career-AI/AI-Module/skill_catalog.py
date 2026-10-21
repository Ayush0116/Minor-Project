
"""
Career Curator AI — Universal Skill Catalog

Supports:
- Detailed skill plans for configured roles
- Generic fallback skills for other career roles
- Skill prerequisites and learning order
- YouTube search links without API usage

This file does not call any AI API.
"""

from urllib.parse import quote_plus
from typing import Any


def skill(
    skill_id: str,
    name: str,
    category: str,
    hours: int,
    order: int,
    prerequisites: list[str] | None = None,
    aliases: list[str] | None = None,
    description: str | None = None,
) -> dict[str, Any]:
    """Create a consistent skill record."""

    return {
        "id": skill_id,
        "name": name,
        "category": category,
        "hours": hours,
        "order": order,
        "prerequisites": prerequisites or [],
        "aliases": aliases or [],
        "description": description
        or f"Learn and practise {name} for your target career.",
        "youtubeUrl": (
            "https://www.youtube.com/results?search_query="
            + quote_plus(name + " tutorial for beginners")
        ),
    }


# -------------------------------------------------------------------
# Curated skill plans
# -------------------------------------------------------------------

SKILL_CATALOG: dict[str, list[dict[str, Any]]] = {
    "frontend_developer": [
        skill(
            "html", "HTML", "Core", 10, 1,
            aliases=["html5", "hypertext markup language"],
        ),
        skill(
            "css", "CSS", "Core", 15, 2,
            prerequisites=["html"],
            aliases=["css3", "cascading style sheets"],
        ),
        skill(
            "javascript", "JavaScript", "Core", 25, 3,
            prerequisites=["html", "css"],
            aliases=["js", "javascript programming"],
        ),
        skill(
            "git", "Git and GitHub", "Tools", 8, 4,
            aliases=["git", "github", "version control"],
        ),
        skill(
            "responsive_design", "Responsive Web Design", "Core", 10, 5,
            prerequisites=["html", "css"],
            aliases=["responsive design", "media queries"],
        ),
        skill(
            "react", "React", "Core", 25, 6,
            prerequisites=["javascript"],
            aliases=["reactjs", "react.js"],
        ),
    ],

    "backend_developer": [
        skill("javascript", "JavaScript", "Core", 20, 1,
              aliases=["js"]),
        skill("git", "Git and GitHub", "Tools", 8, 2,
              aliases=["github", "version control"]),
        skill("nodejs", "Node.js", "Backend", 20, 3,
              prerequisites=["javascript"], aliases=["node", "node.js"]),
        skill("databases", "Database Fundamentals", "Database", 15, 4,
              aliases=["sql", "mysql", "mongodb", "database"]),
        skill("express", "Express.js", "Backend", 15, 5,
              prerequisites=["nodejs"], aliases=["expressjs"]),
        skill("rest_api", "REST APIs", "Backend", 12, 6,
              prerequisites=["express"], aliases=["api", "rest"]),
    ],

    "full_stack_developer": [
        skill("html", "HTML", "Frontend", 10, 1),
        skill("css", "CSS", "Frontend", 15, 2,
              prerequisites=["html"]),
        skill("javascript", "JavaScript", "Core", 25, 3,
              prerequisites=["html", "css"], aliases=["js"]),
        skill("git", "Git and GitHub", "Tools", 8, 4,
              aliases=["github"]),
        skill("react", "React", "Frontend", 25, 5,
              prerequisites=["javascript"], aliases=["reactjs"]),
        skill("nodejs", "Node.js", "Backend", 20, 6,
              prerequisites=["javascript"]),
        skill("express", "Express.js", "Backend", 15, 7,
              prerequisites=["nodejs"]),
        skill("databases", "Database Fundamentals", "Database", 15, 8,
              aliases=["sql", "mongodb", "mysql"]),
        skill("rest_api", "REST APIs", "Backend", 12, 9,
              prerequisites=["express"]),
        skill("deployment", "Deployment Basics", "DevOps", 10, 10,
              prerequisites=["rest_api"],
              aliases=["hosting", "deploy"]),
    ],

    "mobile_developer": [
        skill("programming_basics", "Programming Fundamentals",
              "Core", 20, 1, aliases=["programming"]),
        skill("git", "Git and GitHub", "Tools", 8, 2),
        skill("mobile_ui", "Mobile UI Development", "Mobile", 20, 3,
              prerequisites=["programming_basics"]),
        skill("api_integration", "API Integration", "Mobile", 15, 4,
              prerequisites=["programming_basics"]),
        skill("mobile_storage", "Local Data Storage", "Mobile", 12, 5),
        skill("mobile_testing", "Mobile App Testing", "Quality", 10, 6),
    ],

    "cybersecurity_analyst": [
        skill("networking", "Networking Fundamentals", "Core", 20, 1),
        skill("linux", "Linux Fundamentals", "Tools", 15, 2),
        skill("security_basics", "Security Fundamentals", "Security",
              20, 3, prerequisites=["networking"]),
        skill("python", "Python Basics", "Programming", 20, 4),
        skill("vulnerability", "Vulnerability Assessment", "Security",
              20, 5, prerequisites=["security_basics"]),
        skill("incident_response", "Incident Response", "Security",
              15, 6, prerequisites=["security_basics"]),
    ],

    "cloud_engineer": [
        skill("linux", "Linux Fundamentals", "Core", 15, 1),
        skill("networking", "Networking Fundamentals", "Core", 20, 2),
        skill("git", "Git and GitHub", "Tools", 8, 3),
        skill("cloud_basics", "Cloud Computing Fundamentals",
              "Cloud", 20, 4, prerequisites=["networking"]),
        skill("containers", "Docker and Containers", "DevOps", 20, 5),
        skill("deployment", "Cloud Deployment", "Cloud", 20, 6,
              prerequisites=["cloud_basics"]),
    ],

    "data_analyst": [
        skill("excel", "Excel", "Analytics", 15, 1,
              aliases=["ms excel", "spreadsheets"]),
        skill("statistics", "Statistics Fundamentals", "Analytics", 20, 2),
        skill("sql", "SQL", "Database", 20, 3,
              aliases=["mysql", "postgresql"]),
        skill("python", "Python for Data Analysis", "Programming",
              25, 4, aliases=["pandas", "numpy"]),
        skill("data_visualization", "Data Visualization", "Analytics",
              15, 5, aliases=["charts", "visualization"]),
        skill("power_bi", "Power BI", "Analytics", 15, 6,
              aliases=["tableau", "dashboard"]),
    ],

    "financial_analyst": [
        skill("accounting_fundamentals", "Accounting Fundamentals",
              "Finance", 15, 1, aliases=["accounting"]),
        skill("excel", "Excel", "Tools", 15, 2,
              aliases=["ms excel", "spreadsheets"]),
        skill("financial_statements", "Financial Statements",
              "Finance", 15, 3,
              prerequisites=["accounting_fundamentals"]),
        skill("financial_ratios", "Financial Ratios", "Finance", 10, 4,
              prerequisites=["financial_statements"]),
        skill("financial_modeling", "Financial Modeling", "Finance",
              20, 5, prerequisites=["excel", "financial_statements"]),
        skill("valuation", "Business Valuation", "Finance", 15, 6,
              prerequisites=["financial_modeling"]),
        skill("sql", "SQL", "Analytics", 15, 7),
        skill("data_visualization", "Data Visualization", "Analytics",
              10, 8),
        skill("power_bi", "Power BI", "Analytics", 10, 9),
        skill("business_communication", "Business Communication",
              "Professional", 5, 10),
    ],

    "accountant": [
        skill("accounting_fundamentals", "Accounting Fundamentals",
              "Finance", 20, 1, aliases=["accounting"]),
        skill("excel", "Excel", "Tools", 15, 2),
        skill("financial_statements", "Financial Statements",
              "Finance", 15, 3,
              prerequisites=["accounting_fundamentals"]),
        skill("taxation_basics", "Taxation Basics", "Finance", 20, 4),
        skill("accounting_software", "Accounting Software", "Tools",
              15, 5, aliases=["tally", "tally prime"]),
    ],

    "ui_ux_designer": [
        skill("design_principles", "Design Principles", "Design", 12, 1),
        skill("user_research", "User Research", "Research", 12, 2),
        skill("figma", "Figma", "Tools", 15, 3,
              aliases=["ui design tool"]),
        skill("wireframing", "Wireframing", "Design", 10, 4,
              prerequisites=["design_principles"]),
        skill("prototyping", "Prototyping", "Design", 12, 5,
              prerequisites=["figma", "wireframing"]),
    ],
}


# -------------------------------------------------------------------
# Generic fallback templates
# -------------------------------------------------------------------

# These are starting-point skills, not role-specific expert curricula.
# A generic roadmap should be labelled as a starter plan.

GENERIC_TEMPLATES: dict[str, list[dict[str, Any]]] = {
    "technology": [
        skill("fundamentals", "Core Technical Fundamentals",
              "Core", 20, 1),
        skill("programming", "Programming Fundamentals",
              "Core", 25, 2, prerequisites=["fundamentals"]),
        skill("tools", "Industry Tools and Git",
              "Tools", 12, 3),
        skill("specialization", "Role-Specific Technical Skills",
              "Specialization", 30, 4,
              prerequisites=["fundamentals"]),
        skill("project", "Practical Portfolio Project",
              "Project", 20, 5,
              prerequisites=["programming", "specialization"]),
        skill("interview_prep", "Interview Preparation",
              "Career", 12, 6, prerequisites=["project"]),
    ],

    "data_and_analytics": [
        skill("excel", "Excel and Spreadsheets", "Tools", 15, 1),
        skill("statistics", "Statistics Fundamentals", "Core", 20, 2),
        skill("sql", "SQL and Data Queries", "Data", 20, 3),
        skill("visualization", "Data Visualization", "Data", 15, 4),
        skill("domain_knowledge", "Target Domain Knowledge",
              "Specialization", 20, 5),
        skill("project", "End-to-End Analytics Project",
              "Project", 20, 6,
              prerequisites=["sql", "visualization"]),
    ],

    "finance_and_accounting": [
        skill("accounting", "Accounting Fundamentals", "Core", 20, 1),
        skill("excel", "Excel and Financial Spreadsheets",
              "Tools", 15, 2),
        skill("financial_analysis", "Financial Analysis",
              "Specialization", 20, 3,
              prerequisites=["accounting"]),
        skill("domain_knowledge", "Industry and Regulatory Knowledge",
              "Specialization", 20, 4),
        skill("reporting", "Reporting and Data Interpretation",
              "Professional", 15, 5),
        skill("project", "Practical Financial Case Study",
              "Project", 15, 6,
              prerequisites=["financial_analysis", "reporting"]),
    ],

    "business_and_management": [
        skill("business_fundamentals", "Business Fundamentals",
              "Core", 20, 1),
        skill("communication", "Business Communication",
              "Professional", 12, 2),
        skill("excel", "Excel and Reporting", "Tools", 15, 3),
        skill("analysis", "Problem Solving and Analysis",
              "Core", 20, 4),
        skill("domain_knowledge", "Role-Specific Business Knowledge",
              "Specialization", 20, 5),
        skill("project", "Practical Business Case Study",
              "Project", 15, 6,
              prerequisites=["analysis", "domain_knowledge"]),
    ],

    "design_and_creative": [
        skill("design_fundamentals", "Design Fundamentals",
              "Core", 15, 1),
        skill("tools", "Industry Design Tools", "Tools", 15, 2),
        skill("research", "Audience and User Research",
              "Research", 12, 3),
        skill("execution", "Practical Design Execution",
              "Specialization", 25, 4,
              prerequisites=["design_fundamentals"]),
        skill("portfolio", "Portfolio Development", "Project", 20, 5,
              prerequisites=["execution"]),
        skill("presentation", "Presenting and Explaining Your Work",
              "Professional", 8, 6),
    ],

    "general": [
        skill("fundamentals", "Role Fundamentals", "Core", 20, 1),
        skill("tools", "Relevant Tools and Software", "Tools", 15, 2),
        skill("domain_knowledge", "Domain Knowledge",
              "Specialization", 20, 3),
        skill("communication", "Professional Communication",
              "Professional", 10, 4),
        skill("practical_work", "Practical Assignments",
              "Practice", 20, 5),
        skill("portfolio", "Project or Work Portfolio",
              "Project", 20, 6,
              prerequisites=["practical_work"]),
        skill("interview_prep", "Interview and Career Preparation",
              "Career", 10, 7,
              prerequisites=["portfolio"]),
    ],
}


# -------------------------------------------------------------------
# Category resolution
# -------------------------------------------------------------------

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "technology": [
        "developer", "software", "programmer", "engineer",
        "cybersecurity", "cloud", "devops", "mobile", "web",
        "frontend", "backend", "full stack", "it support",
    ],
    "data_and_analytics": [
        "data analyst", "data scientist", "business intelligence",
        "analytics", "machine learning", "data engineer",
        "statistician",
    ],
    "finance_and_accounting": [
        "financial", "accountant", "accounting", "tax",
        "investment", "credit analyst", "auditor", "banking",
    ],
    "business_and_management": [
        "manager", "management", "business analyst", "marketing",
        "sales", "human resources", "hr ", "operations",
        "project manager", "product manager",
    ],
    "design_and_creative": [
        "designer", "design", "creative", "animator",
        "graphic", "video editor", "photographer",
    ],
}


def resolve_category(
    role_id: str,
    role_name: str = "",
    catalog_category: str = "",
) -> str:
    """Resolve a fallback template category from role metadata."""

    role_text = f"{role_id} {role_name} {catalog_category}".lower()
    role_text = role_text.replace("_", " ").replace("-", " ")

    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in role_text for keyword in keywords):
            return category

    return "general"


# -------------------------------------------------------------------
# Public helper functions
# -------------------------------------------------------------------

def get_role_skill_record(role_id: str) -> Any:
    """Return a configured role's raw skill record, if available."""

    if not role_id:
        return None

    normalized_id = role_id.strip().lower()
    return SKILL_CATALOG.get(normalized_id)


def get_role_skills(
    role_id: str,
    role_name: str = "",
    catalog_category: str = "",
) -> list[dict[str, Any]]:
    """
    Return detailed skills for configured roles.
    Other roles receive a generic starter template.
    """

    normalized_id = (role_id or "").strip().lower()

    configured = SKILL_CATALOG.get(normalized_id)

    if configured:
        return [dict(item) for item in configured]

    category = resolve_category(
        normalized_id,
        role_name=role_name,
        catalog_category=catalog_category,
    )

    template = GENERIC_TEMPLATES.get(
        category,
        GENERIC_TEMPLATES["general"],
    )

    # Return fresh dictionaries so callers cannot mutate the templates.
    result = []

    for item in template:
        copied = dict(item)
        copied["prerequisites"] = list(item.get("prerequisites", []))
        copied["aliases"] = list(item.get("aliases", []))
        result.append(copied)

    return result


def get_youtube_url(skill_name: str) -> str:
    """Build a YouTube search URL without consuming YouTube API quota."""

    query = quote_plus(f"{skill_name} tutorial for beginners")
    return f"https://www.youtube.com/results?search_query={query}"


def get_available_skill_roles() -> list[str]:
    """Return IDs of roles with specifically curated skill plans."""

    return sorted(SKILL_CATALOG.keys())


def is_curated_role(role_id: str) -> bool:
    """True only when the role has a detailed curated skill plan."""

    return (role_id or "").strip().lower() in SKILL_CATALOG
