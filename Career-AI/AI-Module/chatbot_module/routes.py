
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .service import get_chatbot_response

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai",
    tags=["Career Chatbot"],
)


class ChatbotRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )


class ChatbotResponse(BaseModel):
    success: bool
    reply: str


@router.post(
    "/chatbot",
    response_model=ChatbotResponse,
)
async def chatbot(request: ChatbotRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Please enter a message.",
        )

    try:
        reply = await get_chatbot_response(message)

        if not reply or not reply.strip():
            raise HTTPException(
                status_code=502,
                detail="The AI returned an empty response. Please retry.",
            )

        return ChatbotResponse(
            success=True,
            reply=reply.strip(),
        )

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.exception("Career chatbot request failed.")

        raise HTTPException(
            status_code=502,
            detail=(
                "The chatbot is temporarily unavailable. "
                "Please try again in a moment."
            ),
        ) from exc
