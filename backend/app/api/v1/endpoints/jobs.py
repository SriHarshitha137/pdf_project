from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
from app.db.dependencies import get_db
from app.models.job import Job
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.job_schema import (
    JobCreate,
    JobResponse
)
from app.workers.test_worker import test_task

from fastapi.responses import (FileResponse, RedirectResponse)

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post(
    "/create",
    response_model=JobResponse
)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_job = Job(
        file_id=job.file_id,
        tool_name=job.tool_name,
        status="queued",
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return db_job

@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return {
        "job_id": job.id,
        "status": job.status,
        "tool_name": job.tool_name,
        "owner": (job.user.email if job.user else None)
    }

@router.post("/test-task/{job_id}")
def run_test_task(
    job_id: int
):
    task = test_task.delay(job_id)

    return {
        "task_id": task.id
    }

@router.get("/{job_id}/status")
def get_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    response = {
        "job_id": job.id,
        "status": job.status
    }

    if job.status == "completed" and job.output_file_key:
        response["download_url"] = job.output_file_key

    return response


@router.get("/{job_id}/download")
def download_job_output(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if not job.output_file_key:
        raise HTTPException(
            status_code=400,
            detail="Output not ready"
        )

    if job.output_file_key.startswith("http"):
        return RedirectResponse(
            url=job.output_file_key
        )

    return FileResponse(
        path=job.output_file_key
    )
