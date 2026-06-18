import cv2
import numpy as np
from PIL import Image

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import fail_job, start_file_job
from app.workers.image_helpers import open_image, save_image_job


def smart_crop_box(image, target_width, target_height):
    array = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(array, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 160)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        points = np.vstack(contours)
        x, y, w, h = cv2.boundingRect(points)
        center_x = x + w // 2
        center_y = y + h // 2
    else:
        center_x = image.width // 2
        center_y = image.height // 2

    source_ratio = image.width / image.height
    target_ratio = target_width / target_height

    if source_ratio > target_ratio:
        crop_height = image.height
        crop_width = int(crop_height * target_ratio)
    else:
        crop_width = image.width
        crop_height = int(crop_width / target_ratio)

    left = max(0, min(image.width - crop_width, center_x - crop_width // 2))
    top = max(0, min(image.height - crop_height, center_y - crop_height // 2))

    return (
        left,
        top,
        left + crop_width,
        top + crop_height
    )


@celery_app.task
def smart_crop_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        width = int(job.options["width"])
        height = int(job.options["height"])

        with open_image(input_path) as image:
            cropped = image.crop(
                smart_crop_box(image, width, height)
            ).resize(
                (width, height),
                Image.Resampling.LANCZOS
            )

            save_image_job(
                db,
                job,
                cropped,
                f"smart_crop_{job_id}.png",
                "PNG"
            )

    except Exception as e:
        fail_job(db, job, "Smart Crop", job_id, e)

    finally:
        db.close()
