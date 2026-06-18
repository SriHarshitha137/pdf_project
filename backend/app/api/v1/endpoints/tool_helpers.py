from fastapi import HTTPException

from app.models.file import File
from app.models.job import Job


def queue_file_tool(db, current_user, file_id: int, tool_name: str, task, options=None):
    db_file = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == current_user.id
        )
        .first()
    )

    if not db_file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    job_options = {
        "file_id": file_id
    }

    if options:
        job_options.update(options)

    db_job = Job(
        tool_name=tool_name,
        status="queued",
        options=job_options,
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    task.delay(db_job.id)

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }


def queue_text_tool(db, current_user, tool_name: str, task, options):
    db_job = Job(
        tool_name=tool_name,
        status="queued",
        options=options,
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    task.delay(db_job.id)

    return {
        "job_id": db_job.id,
        "status": db_job.status
    }
