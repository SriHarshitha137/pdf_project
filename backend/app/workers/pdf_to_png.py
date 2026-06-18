from zipfile import ZipFile, ZIP_DEFLATED

from pdf2image import convert_from_path

from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


@celery_app.task
def pdf_to_png_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        dpi = job.options.get("dpi", 200)
        output_dir = outputs_dir() / f"pdf_to_png_{job_id}"
        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        images = convert_from_path(
            input_path,
            dpi=dpi,
            poppler_path=settings.POPPLER_PATH
        )

        image_paths = []

        for index, image in enumerate(images, start=1):
            image_path = output_dir / f"page_{index}.png"
            image.save(image_path, "PNG")
            image_paths.append(image_path)

        zip_path = outputs_dir() / f"pdf_to_png_{job_id}.zip"

        with ZipFile(zip_path, "w", ZIP_DEFLATED) as zip_file:
            for image_path in image_paths:
                zip_file.write(
                    image_path,
                    arcname=image_path.name
                )

        complete_job(db, job, zip_path)

    except Exception as e:
        fail_job(db, job, "PDF To PNG", job_id, e)

    finally:
        db.close()
