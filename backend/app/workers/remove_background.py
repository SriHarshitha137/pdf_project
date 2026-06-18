from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


@celery_app.task
def remove_background_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        from rembg import remove

        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        with open(input_path, "rb") as f:
            output_bytes = remove(f.read())

        output_path = outputs_dir() / f"remove_background_{job_id}.png"

        with open(output_path, "wb") as f:
            f.write(output_bytes)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Remove Background", job_id, e)

    finally:
        db.close()
