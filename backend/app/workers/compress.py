import fitz
import subprocess

from pathlib import Path
from datetime import datetime, UTC

from app.core.config import settings
from app.core.celery_app import celery_app

from app.db.session import SessionLocal

from app.models.job import Job
from app.models.file import File

from app.services.file_downloader import (
    download_file
)

from app.services.cloudinary_storage import (
    upload_file
)


@celery_app.task
def compress_task(job_id: int):

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

        file_id = (
            job.options["file_id"]
        )

        compression_percent = (
            job.options[
                "compression_percent"
            ]
        )

        job.status = "processing"

        db.commit()

        db_file = (
            db.query(File)
            .filter(File.id == file_id)
            .first()
        )

        if not db_file:
            raise Exception(
                "File not found"
            )

        input_path = download_file(
            db_file.s3_key
        )

        output_dir = Path(
            "outputs"
        )

        output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        clean_pdf = (
            output_dir
            /
            f"clean_{job_id}.pdf"
        )

        final_pdf = (
            output_dir
            /
            f"compressed_{job_id}.pdf"
        )

    

        doc = fitz.open(
            input_path
        )

        doc.save(
            str(clean_pdf),
            garbage=4,
            deflate=True,
            clean=True
        )

        doc.close()

        

        if compression_percent <= 25:

            pdf_setting = (
                "/prepress"
            )

        elif compression_percent <= 60:

            pdf_setting = (
                "/ebook"
            )

        else:

            pdf_setting = (
                "/screen"
            )


        subprocess.run(
            [
                settings.GHOSTSCRIPT_PATH,

                "-sDEVICE=pdfwrite",

                "-dCompatibilityLevel=1.4",

                f"-dPDFSETTINGS={pdf_setting}",

                "-dNOPAUSE",

                "-dQUIET",

                "-dBATCH",

                f"-sOutputFile={final_pdf}",

                str(clean_pdf)
            ],
            check=True
        )

        cloudinary_url = (
            upload_file(
                str(final_pdf)
            )
        )

        job.output_file_key = (
            cloudinary_url
        )

        job.status = (
            "completed"
        )

        job.completed_at = (
            datetime.now(UTC)
        )

        db.commit()

    except Exception as e:

        print(
            f"Compress Job {job_id} Failed: {e}"
        )

        if job:

            job.status = "failed"

            job.error_message = (
                str(e)
            )

            db.commit()

    finally:

        db.close()