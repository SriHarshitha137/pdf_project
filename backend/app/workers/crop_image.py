from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import fail_job, start_file_job
from app.workers.image_helpers import open_image, save_image_job


@celery_app.task
def crop_image_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        left = int(job.options["left"])
        top = int(job.options["top"])
        width = int(job.options["width"])
        height = int(job.options["height"])

        with open_image(input_path) as image:
            cropped = image.crop(
                (
                    left,
                    top,
                    left + width,
                    top + height
                )
            )

            save_image_job(
                db,
                job,
                cropped,
                f"crop_image_{job_id}.png",
                "PNG"
            )

    except Exception as e:
        fail_job(db, job, "Crop Image", job_id, e)

    finally:
        db.close()
