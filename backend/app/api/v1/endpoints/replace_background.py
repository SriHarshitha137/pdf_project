from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.replace_background_schema import ReplaceBackgroundRequest
from app.workers.replace_background import replace_background_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Replace Background"])


@router.post("/replace-background")
def replace_background(payload: ReplaceBackgroundRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "replace_background", replace_background_task, {"background_color": payload.background_color})
