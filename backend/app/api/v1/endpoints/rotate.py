from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.file import File

from app.schemas.rotate_schema import RotateRequest

from app.workers.rotate import rotate_pdf_task


router = APIRouter(
    prefix="/rotate",
    tags=["Rotate PDF"]
)


@router.post("/")
def rotate_pdf(
    payload: RotateRequest,
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

    if payload.rotation not in [90, 180, 270]:
        raise HTTPException(
            status_code=400,
            detail="Rotation must be 90, 180 or 270"
        )

    db_job = Job(
        tool_name="rotate_pdf",
        status="queued",
        options={
            "file_id": payload.file_id,
            "rotation": payload.rotation
        },
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    rotate_pdf_task.delay(db_job.id)

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }