import json

import yaml

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


@celery_app.task
def yaml_to_json_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        with open(input_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        output_path = outputs_dir() / f"yaml_to_json_{job_id}.json"

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "YAML To JSON", job_id, e)

    finally:
        db.close()
