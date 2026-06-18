from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.crop_image_schema import CropImageRequest
from app.workers.crop_image import crop_image_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Crop Image"])


@router.post("/crop-image")
def crop_image(payload: CropImageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    options = {"left": payload.left, "top": payload.top, "width": payload.width, "height": payload.height}
    return queue_file_tool(db, current_user, payload.file_id, "crop_image", crop_image_task, options)
