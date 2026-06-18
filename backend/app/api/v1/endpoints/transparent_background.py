from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.transparent_background_schema import TransparentBackgroundRequest
from app.workers.transparent_background import transparent_background_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Transparent Background"])


@router.post("/transparent-background")
def transparent_background(payload: TransparentBackgroundRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "transparent_background", transparent_background_task)
