import base64
from urllib.parse import quote, unquote

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import fail_job
from app.workers.text_helpers import complete_text_job, start_text_job


def run_text_task(job_id: int, tool_label: str, output_prefix: str, transform):
    db = SessionLocal()
    job = None

    try:
        job = start_text_job(db, job_id)

        if not job:
            return

        result = transform(job.options["text"])

        complete_text_job(
            db,
            job,
            f"{output_prefix}_{job_id}.txt",
            result
        )

    except Exception as e:
        fail_job(db, job, tool_label, job_id, e)

    finally:
        db.close()


@celery_app.task
def uppercase_to_lowercase_task(job_id: int):
    run_text_task(job_id, "Uppercase To Lowercase", "uppercase_to_lowercase", lambda text: text.lower())


@celery_app.task
def lowercase_to_uppercase_task(job_id: int):
    run_text_task(job_id, "Lowercase To Uppercase", "lowercase_to_uppercase", lambda text: text.upper())


@celery_app.task
def text_to_title_case_task(job_id: int):
    run_text_task(job_id, "Text To Title Case", "text_to_title_case", lambda text: text.title())


@celery_app.task
def text_to_base64_task(job_id: int):
    run_text_task(
        job_id,
        "Text To Base64",
        "text_to_base64",
        lambda text: base64.b64encode(text.encode("utf-8")).decode("ascii")
    )


@celery_app.task
def base64_to_text_task(job_id: int):
    run_text_task(
        job_id,
        "Base64 To Text",
        "base64_to_text",
        lambda text: base64.b64decode(text.encode("ascii"), validate=True).decode("utf-8")
    )


@celery_app.task
def url_encode_task(job_id: int):
    run_text_task(job_id, "URL Encode", "url_encode", lambda text: quote(text, safe=""))


@celery_app.task
def url_decode_task(job_id: int):
    run_text_task(job_id, "URL Decode", "url_decode", unquote)
