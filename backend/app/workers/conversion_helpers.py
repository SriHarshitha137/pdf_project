from pathlib import Path
from datetime import datetime, UTC

from app.models.job import Job
from app.models.file import File
from app.services.file_downloader import download_file
from app.services.cloudinary_storage import upload_file


def start_file_job(db, job_id: int):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        return None, None

    file_id = job.options["file_id"]

    job.status = "processing"
    db.commit()

    db_file = (
        db.query(File)
        .filter(File.id == file_id)
        .first()
    )

    if not db_file:
        raise Exception("File not found")

    input_path = download_file(db_file.s3_key)

    return job, input_path


def outputs_dir():
    output_dir = Path("outputs")
    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )
    return output_dir


def complete_job(db, job, output_path):
    cloudinary_url = upload_file(str(output_path))

    job.output_file_key = cloudinary_url
    job.status = "completed"
    job.completed_at = datetime.now(UTC)

    db.commit()


def fail_job(db, job, tool_name: str, job_id: int, error: Exception):
    print(f"{tool_name} Job {job_id} Failed: {error}")

    if job:
        job.status = "failed"
        job.error_message = str(error)
        db.commit()
