import subprocess
from pathlib import Path

from PIL import Image

from app.core.config import settings
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job
from app.workers.image_helpers import open_image


BACKEND_DIR = Path(__file__).resolve().parents[2]

MODEL_NAMES = {
    "general": "realesrgan-x4plus",
    "soft": "realesrgan-x4plus",
    "anime": "realesrgan-x4plus-anime",
    "anime_fast": "realesr-animevideov3"
}


def resolve_exe_path(exe_path):
    if not exe_path:
        return None

    path = Path(exe_path)

    if path.is_absolute():
        return path

    return BACKEND_DIR / path


def normalized_scale(value):
    scale = int(value)

    if scale not in (2, 3, 4):
        raise Exception("Scale must be 2, 3, or 4")

    return scale


def normalized_model(value, scale):
    if value == "anime_fast":
        return f"realesr-animevideov3-x{scale}"

    if value in MODEL_NAMES:
        return MODEL_NAMES[value]

    if value in MODEL_NAMES.values():
        return value

    raise Exception("Model must be general, soft, anime, or anime_fast")


def save_normalized_png(input_path, output_path):
    with open_image(input_path) as image:
        image = image.convert("RGB")
        image.save(output_path, "PNG")


def pillow_upscale(input_png, output_png, scale):
    with Image.open(input_png) as image:
        upscaled = image.resize(
            (
                image.width * scale,
                image.height * scale
            ),
            Image.Resampling.LANCZOS
        )
        upscaled.save(output_png, "PNG")


def realesrgan_upscale(input_png, output_png, model, scale):
    exe_path = resolve_exe_path(
        getattr(settings, "REAL_ESRGAN_EXE_PATH", None)
    )

    if not exe_path or not exe_path.exists():
        return False

    model_path = exe_path.parent / "models"

    if not model_path.exists():
        return False

    if not (model_path / f"{model}.param").exists():
        return False

    if not (model_path / f"{model}.bin").exists():
        return False

    input_png = Path(input_png).resolve()
    output_png = Path(output_png).resolve()

    subprocess.run(
        [
            str(exe_path),
            "-i",
            str(input_png),
            "-o",
            str(output_png),
            "-n",
            model,
            "-m",
            str(model_path),
            "-s",
            str(scale),
            "-f",
            "png"
        ],
        cwd=str(exe_path.parent),
        check=True
    )

    return output_png.exists()


@celery_app.task
def upscale_image_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        scale = normalized_scale(
            job.options.get("scale", 2)
        )
        model = normalized_model(
            job.options.get("model", "general"),
            scale
        )

        output_dir = outputs_dir()
        normalized_input = (
            output_dir
            /
            f"upscale_image_{job_id}_input.png"
        )
        output_path = (
            output_dir
            /
            f"upscale_image_{job_id}.png"
        )

        save_normalized_png(
            input_path,
            normalized_input
        )

        used_realesrgan = realesrgan_upscale(
            normalized_input,
            output_path,
            model,
            scale
        )

        if not used_realesrgan:
            pillow_upscale(
                normalized_input,
                output_path,
                scale
            )

        job.options["upscale_engine"] = (
            "realesrgan"
            if used_realesrgan
            else "pillow_fallback"
        )

        complete_job(
            db,
            job,
            output_path
        )

    except Exception as e:
        fail_job(db, job, "Upscale Image", job_id, e)

    finally:
        db.close()
