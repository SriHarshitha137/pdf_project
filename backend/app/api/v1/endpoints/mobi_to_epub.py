from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.endpoints.tool_helpers import queue_file_tool
from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.mobi_to_epub_schema import MobiToEpubRequest
from app.workers.mobi_to_epub import mobi_to_epub_task


router = APIRouter(prefix="/tools", tags=["MOBI To EPUB"])


@router.post("/mobi-to-epub")
def mobi_to_epub(
    payload: MobiToEpubRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return queue_file_tool(
        db,
        current_user,
        payload.file_id,
        "mobi_to_epub",
        mobi_to_epub_task
    )
