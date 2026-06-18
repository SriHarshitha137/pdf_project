import time

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.job import Job


@celery_app.task
def test_task(job_id: int):

    db = SessionLocal()

    try:
        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )
        job.status = "processing"
        db.commit()
        print(f"Job {job_id} processing")
        time.sleep(5)
        job.status = "completed"
        db.commit()
        print(f"Job {job_id} completed")

    finally:
        db.close()