from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.file import File

from app.schemas.jpg_to_pdf_schema import (
    JpgToPdfRequest
)

from app.workers.jpg_to_pdf import (
    jpg_to_pdf_task
)


router = APIRouter(
    prefix="/jpg-to-pdf",
    tags=["JPG To PDF"]
)


@router.post("/")
def jpg_to_pdf(
    payload: JpgToPdfRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files = (
        db.query(File)
        .filter(
            File.id.in_(payload.file_ids),
            File.user_id == current_user.id
        )
        .all()
    )

    if len(files) != len(payload.file_ids):
        raise HTTPException(
            status_code=404,
            detail="One or more files not found"
        )

    db_job = Job(
        tool_name="jpg_to_pdf",
        status="queued",
        options={
            "file_ids": payload.file_ids
        },
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    jpg_to_pdf_task.delay(db_job.id)

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }