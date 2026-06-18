import cv2

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


@celery_app.task
def image_to_sketch_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        image = cv2.imread(input_path)

        if image is None:
            raise Exception("Image could not be read")

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        inverted = 255 - gray
        blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
        inverted_blur = 255 - blurred
        sketch = cv2.divide(gray, inverted_blur, scale=256.0)

        output_path = outputs_dir() / f"image_to_sketch_{job_id}.png"
        cv2.imwrite(str(output_path), sketch)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Image To Sketch", job_id, e)

    finally:
        db.close()
