import fitz
import pytesseract

from pathlib import Path
from datetime import datetime, UTC

from pdf2image import convert_from_path

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
from app.core.config import settings

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


@celery_app.task
def ocr_task(job_id: int):

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
        language = job.options["language"]

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

        images = convert_from_path(
            input_path,
            poppler_path=settings.POPPLER_PATH
        )

        extracted_text = ""

        for image in images:

            text = pytesseract.image_to_string(
                image,
                lang=language
            )

            extracted_text += text
            extracted_text += "\n\n"

        output_dir = Path("outputs")

        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        output_path = (
            output_dir
            /
            f"ocr_{job_id}.txt"
        )

        with open(
            output_path,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(
                extracted_text
            )

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
            f"OCR Job {job_id} Failed: {e}"
        )

        if job:

            job.status = "failed"

            job.error_message = (
                str(e)
            )

            db.commit()

    finally:

        db.close()