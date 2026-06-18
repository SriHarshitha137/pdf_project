from pathlib import Path
from datetime import datetime, UTC

from pypdf import PdfReader, PdfWriter

from app.core.celery_app import celery_app
from app.db.session import SessionLocal

from app.models.job import Job
from app.models.file import File

from app.services.file_downloader import (
    download_file
)

from app.services.cloudinary_storage import (
    upload_file
)


@celery_app.task
def protect_pdf_task(job_id: int):

    db = SessionLocal()
    job = None

    try:

        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )

        if not job:
            return

        file_id = job.options["file_id"]
        password = job.options["password"]

        job.status = "processing"
        db.commit()

        db_file = (
            db.query(File)
            .filter(File.id == file_id)
            .first()
        )

        if not db_file:
            raise Exception("File not found")

        input_path = download_file(
            db_file.s3_key
        )

        print(
            f"downloaded={input_path}"
        )

        reader = PdfReader(input_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)

        output_dir = Path("outputs")
        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        output_path = (
            output_dir /
            f"protected_{job_id}.pdf"
        )

        with open(output_path, "wb") as f:
            writer.write(f)

        cloudinary_url = upload_file(
            str(output_path)
        )

        job.output_file_key = (
            cloudinary_url
        )

        job.status = "completed"
        job.completed_at = datetime.now(
            UTC
        )

        db.commit()

    except Exception as e:

        print(
            f"Protect Job {job_id} Failed: {e}"
        )

        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

    finally:

        db.close()