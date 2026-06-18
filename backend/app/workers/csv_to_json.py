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
def csv_to_json_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        df = pd.read_csv(input_path)

        output_path = (
            outputs_dir()
            /
            f"csv_to_json_{job_id}.json"
        )

        df.to_json(
            output_path,
            orient="records",
            indent=2,
            force_ascii=False
        )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "CSV To JSON", job_id, e)

    finally:
        db.close()
