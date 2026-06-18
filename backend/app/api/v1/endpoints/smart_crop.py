from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.smart_crop_schema import SmartCropRequest
from app.workers.smart_crop import smart_crop_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Smart Crop"])


@router.post("/smart-crop")
def smart_crop(payload: SmartCropRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "smart_crop", smart_crop_task, {"width": payload.width, "height": payload.height})
