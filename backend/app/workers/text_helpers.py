from datetime import datetime, UTC

from app.models.job import Job
from app.services.cloudinary_storage import upload_file
from app.workers.conversion_helpers import outputs_dir


def start_text_job(db, job_id: int):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        return None

    job.status = "processing"
    db.commit()

    return job


def complete_text_job(db, job, output_name: str, content: str):
    output_path = outputs_dir() / output_name

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    job.output_file_key = upload_file(str(output_path))
    job.status = "completed"
    job.completed_at = datetime.now(UTC)
    db.commit()
