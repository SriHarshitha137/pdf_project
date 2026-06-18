import qrcode

from pathlib import Path
from datetime import datetime, UTC

from app.core.celery_app import celery_app

from app.db.session import SessionLocal

from app.models.job import Job

from app.services.cloudinary_storage import (
    upload_file
)

@celery_app.task
def qr_generator_task(job_id: int):

    db = SessionLocal()
    job = None

    try:

        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )

        if not job:
            return

        url = job.options["url"]

        job.status = "processing"

        db.commit()

        output_dir = Path(
            "outputs"
        )

        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        output_path = (
            output_dir
            /
            f"qr_{job_id}.png"
        )

        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=4
        )

        qr.add_data(url)

        qr.make(
            fit=True
        )

        image = qr.make_image()

        image.save(
            str(output_path)
        )

        cloudinary_url = upload_file(
            str(output_path)
        )

        job.output_file_key = (
            cloudinary_url
        )

        job.status = "completed"

        job.completed_at = (
            datetime.now(UTC)
        )

        db.commit()

    except Exception as e:

        print(
            f"QR Generator Job {job_id} Failed: {e}"
        )

        if job:

            job.status = "failed"

            job.error_message = str(e)

            db.commit()

    finally:

        db.close()