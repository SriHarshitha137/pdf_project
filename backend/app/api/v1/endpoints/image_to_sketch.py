from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.image_to_sketch_schema import ImageToSketchRequest
from app.workers.image_to_sketch import image_to_sketch_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Image To Sketch"])


@router.post("/image-to-sketch")
def image_to_sketch(payload: ImageToSketchRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "image_to_sketch", image_to_sketch_task)
