from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.endpoints.tool_helpers import queue_file_tool
from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.image_to_anime_schema import ImageToAnimeRequest
from app.workers.image_to_anime import image_to_anime_task


router = APIRouter(prefix="/tools", tags=["Image To Anime"])


@router.post("/image-to-anime")
def image_to_anime(
    payload: ImageToAnimeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return queue_file_tool(
        db,
        current_user,
        payload.file_id,
        "image_to_anime",
        image_to_anime_task
    )
