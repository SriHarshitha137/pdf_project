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
def png_to_jpg_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = (
            outputs_dir()
            /
            f"png_to_jpg_{job_id}.jpg"
        )

        with Image.open(input_path) as image:
            image = ImageOps.exif_transpose(image).convert("RGBA")
            background = Image.new("RGB", image.size, "white")
            background.paste(image, mask=image.getchannel("A"))
            background.save(
                output_path,
                "JPEG",
                quality=95,
                optimize=True
            )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "PNG To JPG", job_id, e)

    finally:
        db.close()
