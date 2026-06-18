import cv2

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


@celery_app.task
def image_to_cartoon_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        image = cv2.imread(input_path)

        if image is None:
            raise Exception("Image could not be read")

        color = cv2.bilateralFilter(image, 9, 250, 250)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 7)
        edges = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY,
            9,
            2
        )
        cartoon = cv2.bitwise_and(
            color,
            color,
            mask=edges
        )

        output_path = outputs_dir() / f"image_to_cartoon_{job_id}.png"
        cv2.imwrite(str(output_path), cartoon)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Image To Cartoon", job_id, e)

    finally:
        db.close()
