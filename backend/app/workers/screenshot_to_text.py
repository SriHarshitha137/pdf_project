from PIL import Image, ImageOps
import pytesseract

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


@celery_app.task
def screenshot_to_text_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        language = job.options.get("language", "eng")

        with Image.open(input_path) as image:
            image = ImageOps.exif_transpose(image)
            extracted_text = pytesseract.image_to_string(
                image,
                lang=language
            )

        output_path = (
            outputs_dir()
            /
            f"screenshot_to_text_{job_id}.txt"
        )

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(extracted_text)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Screenshot To Text", job_id, e)

    finally:
        db.close()
