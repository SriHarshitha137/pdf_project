import subprocess

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job
from app.workers.pdf_to_epub import get_ebook_convert_path


@celery_app.task
def mobi_to_epub_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        output_path = outputs_dir() / f"mobi_to_epub_{job_id}.epub"

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
        fail_job(db, job, "MOBI To EPUB", job_id, e)

    finally:
        db.close()
