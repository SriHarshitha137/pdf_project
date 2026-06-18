from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


@celery_app.task
def pdf_to_html_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = (
            outputs_dir()
            /
            f"pdf_to_html_{job_id}.html"
        )

        with open(input_path, "rb") as input_file:
            with open(output_path, "w", encoding="utf-8") as output_file:
                extract_text_to_fp(
                    input_file,
                    output_file,
                    laparams=LAParams(),
                    output_type="html",
                    codec=None
                )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "PDF To HTML", job_id, e)

    finally:
        db.close()
