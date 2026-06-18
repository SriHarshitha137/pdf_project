from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.endpoints.tool_helpers import queue_file_tool
from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.image_to_avatar_schema import ImageToAvatarRequest
from app.workers.image_to_avatar import image_to_avatar_task


router = APIRouter(prefix="/tools", tags=["Image To Avatar"])


@router.post("/image-to-avatar")
def image_to_avatar(
    payload: ImageToAvatarRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return queue_file_tool(
        db,
        current_user,
        payload.file_id,
        "image_to_avatar",
        image_to_avatar_task
    )
