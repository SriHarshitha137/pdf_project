import json

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
def json_to_csv_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list):
            df = pd.json_normalize(data)
        elif isinstance(data, dict):
            if data and all(isinstance(value, list) for value in data.values()):
                df = pd.DataFrame(data)
            else:
                df = pd.json_normalize(data)
        else:
            raise Exception("JSON root must be an object or array")

        output_path = (
            outputs_dir()
            /
            f"json_to_csv_{job_id}.csv"
        )

        df.to_csv(
            output_path,
            index=False
        )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "JSON To CSV", job_id, e)

    finally:
        db.close()
