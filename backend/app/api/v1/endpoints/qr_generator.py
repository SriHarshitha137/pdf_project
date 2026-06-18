from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.models.job import Job
from app.core.security import get_current_user
from app.models.user import User

from app.schemas.qr_generator_schema import (
    QrGeneratorRequest
)

from app.workers.qr_generator import (
    qr_generator_task
)

router = APIRouter(
    prefix="/tools",
    tags=["QR Generator"]
)

@router.post("/generate-qr")
def generate_qr(
    payload: QrGeneratorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    db_job = Job(
        tool_name="qr_generator",
        status="queued",
        options={
            "url": payload.url
        },
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    qr_generator_task.delay(
        db_job.id
    )

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }