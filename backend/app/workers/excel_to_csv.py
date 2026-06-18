import pandas as pd

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import (
    complete_job,
    fail_job,
    outputs_dir,
    start_file_job
)


@celery_app.task
def excel_to_csv_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        df = pd.read_excel(input_path)

        output_path = (
            outputs_dir()
            /
            f"excel_to_csv_{job_id}.csv"
        )

        df.to_csv(
            output_path,
            index=False
        )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Excel To CSV", job_id, e)

    finally:
        db.close()
