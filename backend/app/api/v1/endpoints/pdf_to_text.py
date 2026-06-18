from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.file import File
from app.models.job import Job

from app.schemas.pdf_to_text_schema import (
    PdfToTextRequest
)

from app.workers.pdf_to_text import (
    pdf_to_text_task
)

router = APIRouter(
    prefix="/tools",
    tags=["PDF To Text"]
)

@router.post("/pdf-to-text")
def pdf_to_text(
    payload: PdfToTextRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    db_file = (
        db.query(File)
        .filter(
            File.id == payload.file_id,
            File.user_id == current_user.id
        )
        .first()
    )

    if not db_file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    db_job = Job(
        tool_name="pdf_to_text",
        status="queued",
        options={
            "file_id": payload.file_id
        },
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    pdf_to_text_task.delay(
        db_job.id
    )

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }