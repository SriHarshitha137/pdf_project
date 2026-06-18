from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.compress_webp_schema import CompressWebpRequest
from app.workers.compress_webp import compress_webp_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["Compress WEBP"])


@router.post("/compress-webp")
def compress_webp(payload: CompressWebpRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "compress_webp", compress_webp_task, {"quality": payload.quality})
