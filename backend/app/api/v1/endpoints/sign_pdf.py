from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.file import File
from app.models.job import Job

from app.schemas.sign_pdf_schema import (
    SignPdfRequest
)

from app.workers.sign_pdf import (
    sign_pdf_task
)

router = APIRouter(
    prefix="/tools",
    tags=["Sign PDF"]
)

@router.post("/sign-pdf")
def sign_pdf(
    payload: SignPdfRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if payload.mode not in ["typed", "image", "digital"]:
        raise HTTPException(
            status_code=400,
            detail="mode must be typed, image or digital"
        )

    pdf_file = (
        db.query(File)
        .filter(
            File.id == payload.pdf_file_id,
            File.user_id == current_user.id
        )
        .first()
    )

    if not pdf_file:
        raise HTTPException(
            status_code=404,
            detail="PDF not found"
        )

    if payload.mode == "typed":
        if not payload.signature_text:
            raise HTTPException(
                status_code=400,
                detail="signature_text required for typed mode"
            )

    if payload.mode == "image":
        if not payload.signature_file_id:
            raise HTTPException(
                status_code=400,
                detail="signature_file_id required for image mode"
            )
        sig_file = (
            db.query(File)
            .filter(
                File.id == payload.signature_file_id,
                File.user_id == current_user.id
            )
            .first()
        )
        if not sig_file:
            raise HTTPException(
                status_code=404,
                detail="Signature image not found"
            )

    if payload.mode == "digital":
        if not payload.certificate_file_id or not payload.password:
            raise HTTPException(
                status_code=400,
                detail="certificate_file_id and password required for digital mode"
            )
        cert_file = (
            db.query(File)
            .filter(
                File.id == payload.certificate_file_id,
                File.user_id == current_user.id
            )
            .first()
        )
        if not cert_file:
            raise HTTPException(
                status_code=404,
                detail="Certificate not found"
            )

    db_job = Job(
        tool_name="sign_pdf",
        status="queued",
        options={
            "pdf_file_id": payload.pdf_file_id,
            "mode": payload.mode,
            "signature_text": payload.signature_text,
            "signature_file_id": payload.signature_file_id,
            "certificate_file_id": payload.certificate_file_id,
            "password": payload.password,
            "page": payload.page,
            "x": payload.x,
            "y": payload.y
        },
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    sign_pdf_task.delay(
        db_job.id
    )

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }