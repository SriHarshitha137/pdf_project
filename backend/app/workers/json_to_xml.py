import json

from lxml import etree

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


def append_xml(parent, value, name="item"):
    if isinstance(value, dict):
        for key, child_value in value.items():
            child = etree.SubElement(parent, str(key))
            append_xml(child, child_value)
    elif isinstance(value, list):
        for item in value:
            child = etree.SubElement(parent, name)
            append_xml(child, item)
    elif value is not None:
        parent.text = str(value)


@celery_app.task
def json_to_xml_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        root = etree.Element("root")
        append_xml(root, data)

        output_path = outputs_dir() / f"json_to_xml_{job_id}.xml"
        tree = etree.ElementTree(root)
        tree.write(
            str(output_path),
            pretty_print=True,
            xml_declaration=True,
            encoding="utf-8"
        )

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "JSON To XML", job_id, e)

    finally:
        db.close()
