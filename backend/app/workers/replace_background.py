from io import BytesIO

from PIL import Image, ImageColor

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


@celery_app.task
def replace_background_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        from rembg import remove

        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        background_color = job.options.get("background_color", "#ffffff")

        with open(input_path, "rb") as f:
            output_bytes = remove(f.read())

        foreground = Image.open(BytesIO(output_bytes)).convert("RGBA")
        background = Image.new(
            "RGBA",
            foreground.size,
            ImageColor.getcolor(background_color, "RGBA")
        )
        background.alpha_composite(foreground)

        output_path = outputs_dir() / f"replace_background_{job_id}.png"
        background.convert("RGB").save(output_path, "PNG")

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Replace Background", job_id, e)

    finally:
        db.close()
