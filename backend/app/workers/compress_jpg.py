from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import fail_job, start_file_job
from app.workers.image_helpers import open_image, save_image_job


@celery_app.task
def compress_jpg_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        quality = max(1, min(95, int(job.options.get("quality", 75))))

        with open_image(input_path).convert("RGB") as image:
            save_image_job(
                db,
                job,
                image,
                f"compress_jpg_{job_id}.jpg",
                "JPEG",
                quality=quality,
                optimize=True
            )

    except Exception as e:
        fail_job(db, job, "Compress JPG", job_id, e)

    finally:
        db.close()
