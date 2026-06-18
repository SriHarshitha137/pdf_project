import cv2
from pathlib import Path
from PIL import Image

from app.core.config import settings
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


BACKEND_DIR = Path(__file__).resolve().parents[2]


def resolve_model_path(model_path):
    path = Path(model_path)

    if path.is_absolute():
        return str(path)

    return str(BACKEND_DIR / path)


def avatar_with_mediapipe(input_path, output_path):
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision

    model_path = getattr(settings, "MEDIAPIPE_FACE_STYLIZER_MODEL_PATH", None)

    if not model_path:
        raise Exception("MEDIAPIPE_FACE_STYLIZER_MODEL_PATH is not configured")

    if not hasattr(vision, "FaceStylizer") or not hasattr(vision, "FaceStylizerOptions"):
        raise Exception("MediaPipe Face Stylizer is not available in this Python package")

    base_options = python.BaseOptions(
        model_asset_path=resolve_model_path(model_path)
    )
    options = vision.FaceStylizerOptions(base_options=base_options)

    with vision.FaceStylizer.create_from_options(options) as stylizer:
        image = mp.Image.create_from_file(input_path)
        result = stylizer.stylize(image)

    if result is None:
        raise Exception("No face detected for avatar stylization")

    output_image = Image.fromarray(result.numpy_view())
    output_image.save(output_path, "PNG")


def avatar_with_opencv(input_path, output_path):
    image = cv2.imread(str(input_path), cv2.IMREAD_COLOR)

    if image is None:
        raise Exception("Image could not be read")

    max_side = 1600
    height, width = image.shape[:2]
    scale = min(1.0, max_side / max(width, height))

    if scale < 1.0:
        image = cv2.resize(
            image,
            (
                int(width * scale),
                int(height * scale)
            ),
            interpolation=cv2.INTER_AREA
        )

    smooth = image

    for _ in range(2):
        smooth = cv2.bilateralFilter(smooth, 9, 80, 80)

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
    edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    stylized = cv2.bitwise_and(smooth, edges)
    hsv = cv2.cvtColor(stylized, cv2.COLOR_BGR2HSV)
    hsv[:, :, 1] = cv2.multiply(hsv[:, :, 1], 1.25)
    stylized = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    cv2.imwrite(str(output_path), stylized)


def avatar_with_gfpgan(input_path, output_path):
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

    image = cv2.imread(input_path, cv2.IMREAD_COLOR)

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
def image_to_avatar_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = outputs_dir() / f"image_to_avatar_{job_id}.png"

        used_engine = None

        if getattr(settings, "MEDIAPIPE_FACE_STYLIZER_MODEL_PATH", None):
            try:
                avatar_with_mediapipe(input_path, output_path)
                used_engine = "mediapipe"
            except Exception as mediapipe_error:
                print(f"Image To Avatar MediaPipe fallback: {mediapipe_error}")

        if used_engine is None and getattr(settings, "GFPGAN_MODEL_PATH", None):
            avatar_with_gfpgan(input_path, output_path)
            used_engine = "gfpgan"

        if used_engine is None:
            avatar_with_opencv(input_path, output_path)
            used_engine = "opencv"

        job.options["avatar_engine"] = used_engine
        db.commit()

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Image To Avatar", job_id, e)

    finally:
        db.close()
