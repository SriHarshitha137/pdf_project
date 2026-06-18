from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.downscale_image_schema import DownscaleImageRequest
from app.workers.downscale_image import downscale_image_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Downscale Image"])


@router.post("/downscale-image")
def downscale_image(payload: DownscaleImageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "downscale_image", downscale_image_task, {"max_width": payload.max_width, "max_height": payload.max_height})
