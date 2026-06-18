from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.resize_image_schema import ResizeImageRequest
from app.workers.resize_image import resize_image_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Resize Image"])


@router.post("/resize-image")
def resize_image(payload: ResizeImageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "resize_image", resize_image_task, {"width": payload.width, "height": payload.height})
