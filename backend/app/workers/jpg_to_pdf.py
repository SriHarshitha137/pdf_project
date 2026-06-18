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
def jpg_to_pdf_task(job_id: int):

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

        file_ids = job.options["file_ids"]

        job.status = "processing"
        db.commit()

        files = (
            db.query(File)
            .filter(File.id.in_(file_ids))
            .all()
        )

        pdf = fitz.open()

        for db_file in files:

            image_path = download_file(
                db_file.s3_key
            )

            print(
                f"downloaded={image_path}"
            )

            img_doc = fitz.open(
                image_path
            )

            rect = img_doc[0].rect

            page = pdf.new_page(
                width=rect.width,
                height=rect.height
            )

            page.insert_image(
                rect,
                filename=image_path
            )

            img_doc.close()

        output_dir = Path("outputs")
        output_dir.mkdir(
            exist_ok=True
        )

        output_path = (
            output_dir /
            f"jpg_to_pdf_{job_id}.pdf"
        )

        pdf.save(str(output_path))
        pdf.close()

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
            f"JPG to PDF Job {job_id} Failed: {e}"
        )

        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

    finally:

        db.close()