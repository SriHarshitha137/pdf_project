import shutil
import subprocess
from pathlib import Path

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


def get_ebook_convert_path():
    command_path = shutil.which("ebook-convert")

    if command_path:
        return command_path

    windows_path = Path(
        r"C:\Program Files\Calibre2\ebook-convert.exe"
    )

    if windows_path.exists():
        return str(windows_path)

    raise Exception(
        "Calibre ebook-convert not found. Install Calibre and make ebook-convert available in PATH."
    )


@celery_app.task
def pdf_to_epub_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = (
            outputs_dir()
            /
            f"pdf_to_epub_{job_id}.epub"
        )

        subprocess.run(
            [
                get_ebook_convert_path(),
                input_path,
                str(output_path)
            ],
            check=True
        )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "PDF To EPUB", job_id, e)

    finally:
        db.close()
