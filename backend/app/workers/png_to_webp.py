from PIL import Image, ImageOps

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


@celery_app.task
def png_to_webp_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = (
            outputs_dir()
            /
            f"png_to_webp_{job_id}.webp"
        )

        with Image.open(input_path) as image:
            image = ImageOps.exif_transpose(image)
            image.save(
                output_path,
                "WEBP",
                quality=90,
                method=6
            )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "PNG To WEBP", job_id, e)

    finally:
        db.close()
