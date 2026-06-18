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
def merge_pdf_task(job_id: int):

    db = SessionLocal()

    try:

        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )

        if not job:
            return

        file_ids = job.options["file_ids"]

        job.status = "processing"
        db.commit()

        files = (
            db.query(File)
            .filter(File.id.in_(file_ids))
            .all()
        )

        merged_pdf = fitz.open()

        for db_file in files:

            local_file = download_file(
                db_file.s3_key
            )
            print("DOWNLOADED", local_file)
            pdf = fitz.open(local_file)

            merged_pdf.insert_pdf(pdf)

            pdf.close()

        OUTPUT_DIR = Path("outputs")
        OUTPUT_DIR.mkdir(
            exist_ok=True
        )

        output_path = (
            OUTPUT_DIR /
            f"merged_{job_id}.pdf"
        )

        merged_pdf.save(
            str(output_path)
        )

        merged_pdf.close()

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
            f"Merge Job {job_id} Failed: {e}"
        )

        if job:
            job.status = "failed"
            job.error_message = str(e)

            db.commit()

    finally:

        db.close()