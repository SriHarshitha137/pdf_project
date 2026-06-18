from PIL import Image, ImageDraw

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import fail_job, start_file_job
from app.workers.image_helpers import open_image, save_image_job


@celery_app.task
def circle_crop_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        with open_image(input_path).convert("RGBA") as image:
            size = min(image.size)
            left = (image.width - size) // 2
            top = (image.height - size) // 2
            image = image.crop((left, top, left + size, top + size))

            mask = Image.new("L", (size, size), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, size, size), fill=255)
            image.putalpha(mask)

            save_image_job(
                db,
                job,
                image,
                f"circle_crop_{job_id}.png",
                "PNG"
            )

    except Exception as e:
        fail_job(db, job, "Circle Crop", job_id, e)

    finally:
        db.close()
