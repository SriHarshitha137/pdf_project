from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.remove_background_schema import RemoveBackgroundRequest
from app.workers.remove_background import remove_background_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Remove Background"])


@router.post("/remove-background")
def remove_background(payload: RemoveBackgroundRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "remove_background", remove_background_task)
