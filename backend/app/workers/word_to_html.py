import subprocess

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


@celery_app.task
def word_to_html_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = (
            outputs_dir()
            /
            f"word_to_html_{job_id}.html"
        )

        subprocess.run(
            [
                "pandoc",
                input_path,
                "-t",
                "html",
                "-o",
                str(output_path)
            ],
            check=True
        )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Word To HTML", job_id, e)

    finally:
        db.close()
