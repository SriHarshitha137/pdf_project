from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.file import File
from app.models.job import Job
from app.schemas.png_to_jpg_schema import PngToJpgRequest
from app.workers.png_to_jpg import png_to_jpg_task


router = APIRouter(
    prefix="/tools",
    tags=["PNG To JPG"]
)


@router.post("/png-to-jpg")
def png_to_jpg(
    payload: PngToJpgRequest,
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
        tool_name="png_to_jpg",
        status="queued",
        options={"file_id": payload.file_id},
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    png_to_jpg_task.delay(db_job.id)

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }
