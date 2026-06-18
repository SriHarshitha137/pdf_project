from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.endpoints.tool_helpers import queue_file_tool
from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.epub_to_pdf_schema import EpubToPdfRequest
from app.workers.epub_to_pdf import epub_to_pdf_task


router = APIRouter(prefix="/tools", tags=["EPUB To PDF"])


@router.post("/epub-to-pdf")
def epub_to_pdf(
    payload: EpubToPdfRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return queue_file_tool(
        db,
        current_user,
        payload.file_id,
        "epub_to_pdf",
        epub_to_pdf_task
    )
