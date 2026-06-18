from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


@celery_app.task
def handwriting_to_text_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        import easyocr

        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        language = job.options.get("language", "en")
        reader = easyocr.Reader([language], gpu=False)
        lines = reader.readtext(
            input_path,
            detail=0,
            paragraph=True
        )

        output_path = outputs_dir() / f"handwriting_to_text_{job_id}.txt"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "Handwriting To Text", job_id, e)

    finally:
        db.close()
