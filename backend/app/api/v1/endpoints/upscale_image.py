from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.upscale_image_schema import UpscaleImageRequest
from app.workers.upscale_image import upscale_image_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Upscale Image"])


@router.post("/upscale-image")
def upscale_image(payload: UpscaleImageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(
        db,
        current_user,
        payload.file_id,
        "upscale_image",
        upscale_image_task,
        {
            "scale": payload.scale,
            "model": payload.model
        }
    )
