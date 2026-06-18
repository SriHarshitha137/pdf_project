import fitz
import shutil

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
def split_pdf_task(job_id: int):

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

        doc = fitz.open(input_path)

        output_dir = (
            Path("outputs")
            / f"split_{job_id}"
        )

        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        for page_num in range(len(doc)):

            new_pdf = fitz.open()

            new_pdf.insert_pdf(
                doc,
                from_page=page_num,
                to_page=page_num
            )

            page_path = (
                output_dir /
                f"page_{page_num + 1}.pdf"
            )

            new_pdf.save(
                str(page_path)
            )

            new_pdf.close()

        doc.close()

        zip_path = shutil.make_archive(
            str(output_dir),
            "zip",
            str(output_dir)
        )

        cloudinary_url = upload_file(
            zip_path
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
            f"Split Job {job_id} Failed: {e}"
        )

        if job:
            job.status = "failed"
            job.error_message = str(e)

            db.commit()

    finally:

        db.close()