from PIL import Image

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import fail_job, start_file_job
from app.workers.image_helpers import open_image, save_image_job


@celery_app.task
def downscale_image_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        max_width = int(job.options["max_width"])
        max_height = int(job.options["max_height"])

        with open_image(input_path) as image:
            image.thumbnail(
                (max_width, max_height),
                Image.Resampling.LANCZOS
            )

            save_image_job(
                db,
                job,
                image,
                f"downscale_image_{job_id}.png",
                "PNG"
            )

    except Exception as e:
        fail_job(db, job, "Downscale Image", job_id, e)

    finally:
        db.close()
