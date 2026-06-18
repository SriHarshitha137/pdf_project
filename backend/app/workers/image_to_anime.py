import cv2
import numpy as np

from app.core.config import settings
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


def opencv_anime_transform(input_path, output_path):
    image = cv2.imread(input_path)

    if image is None:
        raise Exception("Image could not be read")

    smooth = cv2.bilateralFilter(image, 11, 110, 110)
    color = cv2.stylization(smooth, sigma_s=65, sigma_r=0.45)
    hsv = cv2.cvtColor(color, cv2.COLOR_BGR2HSV)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.35, 0, 255)
    saturated = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

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
    result = cv2.bitwise_and(
        saturated,
        saturated,
        mask=edges
    )

    cv2.imwrite(str(output_path), result)


def enhance_with_gfpgan(input_path, output_path):
    from gfpgan import GFPGANer

    model_path = getattr(settings, "GFPGAN_MODEL_PATH", None)

    if not model_path:
        raise Exception("GFPGAN_MODEL_PATH is not configured")

    restorer = GFPGANer(
        model_path=model_path,
        upscale=1,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=None
    )

    image = cv2.imread(str(input_path), cv2.IMREAD_COLOR)

    if image is None:
        raise Exception("Image could not be read")

    _, _, restored_image = restorer.enhance(
        image,
        has_aligned=False,
        only_center_face=False,
        paste_back=True
    )

    cv2.imwrite(str(output_path), restored_image)


@celery_app.task
def image_to_anime_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = outputs_dir() / f"image_to_anime_{job_id}.png"
        opencv_anime_transform(input_path, output_path)

        if getattr(settings, "GFPGAN_MODEL_PATH", None):
            enhance_with_gfpgan(output_path, output_path)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Image To Anime", job_id, e)

    finally:
        db.close()
