import fitz

from pathlib import Path
from datetime import datetime, UTC

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
def rotate_pdf_task(job_id: int):

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
        rotation = job.options["rotation"]

        print(f"file_id={file_id}")
        print(f"rotation={rotation}")

        job.status = "processing"
        db.commit()

        print(f"Rotate Job {job_id} Started")

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

        print(f"downloaded={input_path}")

        doc = fitz.open(input_path)

        for page_num in range(len(doc)):
            page = doc[page_num]
            page.set_rotation(rotation)

        output_dir = Path("outputs")
        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        output_path = (
            output_dir /
            f"rotated_{job_id}.pdf"
        )

        print(f"saving to {output_path}")

        doc.save(str(output_path))
        doc.close()

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

        print(
            f"Rotate Job {job_id} Completed"
        )

    except Exception as e:

        print("ROTATE ERROR")
        print(repr(e))

        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

    finally:
        db.close()