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
def organize_pdf_task(job_id: int):

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
        page_order = job.options["page_order"]

        job.status = "processing"
        db.commit()

        db_file = (
            db.query(File)
            .filter(File.id == file_id)
            .first()
        )

        if not db_file:
            raise Exception(
                "File not found"
            )

        input_path = download_file(
            db_file.s3_key
        )

        source_pdf = fitz.open(
            input_path
        )

        new_pdf = fitz.open()

        total_pages = len(source_pdf)

        for page_number in page_order:

            if (
                page_number < 1
                or
                page_number > total_pages
            ):
                raise Exception(
                    f"Invalid page: {page_number}"
                )

            new_pdf.insert_pdf(
                source_pdf,
                from_page=page_number - 1,
                to_page=page_number - 1
            )

        output_dir = Path("outputs")

        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        output_path = (
            output_dir
            /
            f"organized_{job_id}.pdf"
        )

        new_pdf.save(
            str(output_path)
        )

        source_pdf.close()
        new_pdf.close()

        cloudinary_url = upload_file(
            str(output_path)
        )

        job.output_file_key = (
            cloudinary_url
        )

        job.status = "completed"

        job.completed_at = (
            datetime.now(UTC)
        )

        db.commit()

    except Exception as e:

        print(
            f"Organize Job {job_id} Failed: {e}"
        )

        if job:

            job.status = "failed"

            job.error_message = (
                str(e)
            )

            db.commit()

    finally:

        db.close()