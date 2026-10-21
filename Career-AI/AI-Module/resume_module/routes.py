
import logging
from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel, Field

from .parser import (
    MAX_FILE_SIZE,
    ResumeParsingError,
    extract_resume_text,
)
from .service import analyze_resume, generate_improvement


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai/resume",
    tags=["Resume Intelligence"],
)


class ResumeImprovementRequest(BaseModel):
    text: str = Field(min_length=1, max_length=12000)
    targetRole: str = Field(
        default="Full Stack Developer",
        min_length=1,
        max_length=150,
    )


def validate_target_role(target_role: str) -> str:
    target_role = target_role.strip()

    if not target_role:
        raise HTTPException(
            status_code=422,
            detail="Please provide a target role.",
        )

    return target_role


def raise_ai_error(exc: Exception):
    # Keep sensitive provider details out of application logs.
    logger.exception(
        "Resume Intelligence request failed (%s).",
        type(exc).__name__,
    )

    message = str(exc) or "Resume AI service is unavailable."

    if "authentication failed" in message.lower():
        status_code = 502
    elif "insufficient credits" in message.lower():
        status_code = 502
    elif "rate limit" in message.lower():
        status_code = 503
    elif "timed out" in message.lower():
        status_code = 504
    elif "truncated" in message.lower():
        status_code = 502
    elif "invalid json" in message.lower():
        status_code = 502
    else:
        status_code = 502

    raise HTTPException(
        status_code=status_code,
        detail=message,
    ) from exc


@router.post("/analyze")
async def resume_analysis(
    file: UploadFile = File(...),
    targetRole: str = Form("Full Stack Developer"),
):
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    try:
        if extension not in {".pdf", ".docx"}:
            raise HTTPException(
                status_code=415,
                detail="Upload a PDF or DOCX resume.",
            )

        content = await file.read(MAX_FILE_SIZE + 1)

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Resume file must be 5 MB or smaller.",
            )

        role = validate_target_role(targetRole)
        resume_text = extract_resume_text(filename, content)

        # Only extracted text is sent to the AI provider.
        del content

        return await analyze_resume(resume_text, role)

    except ResumeParsingError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise_ai_error(exc)

    finally:
        await file.close()


@router.post("/improve-summary")
async def improve_summary(request: ResumeImprovementRequest):
    try:
        role = validate_target_role(request.targetRole)

        return await generate_improvement(
            action="summary",
            text=request.text,
            target_role=role,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise_ai_error(exc)


@router.post("/rewrite-bullets")
async def rewrite_bullets(request: ResumeImprovementRequest):
    try:
        role = validate_target_role(request.targetRole)

        return await generate_improvement(
            action="bullets",
            text=request.text,
            target_role=role,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise_ai_error(exc)


@router.post("/improvement-plan")
async def improvement_plan(request: ResumeImprovementRequest):
    try:
        role = validate_target_role(request.targetRole)

        return await generate_improvement(
            action="plan",
            text=request.text,
            target_role=role,
        )

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise_ai_error(exc)
