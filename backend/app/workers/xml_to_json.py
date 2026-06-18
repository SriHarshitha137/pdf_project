import json

from lxml import etree

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.workers.conversion_helpers import complete_job, fail_job, outputs_dir, start_file_job


def element_to_data(element):
    children = list(element)

    if not children:
        text = element.text.strip() if element.text else ""
        return text

    data = {}

    for child in children:
        child_data = element_to_data(child)

        if child.tag in data:
            if not isinstance(data[child.tag], list):
                data[child.tag] = [data[child.tag]]
            data[child.tag].append(child_data)
        else:
            data[child.tag] = child_data

    return data


@celery_app.task
def xml_to_json_task(job_id: int):
    db = SessionLocal()
    job = None

    try:
        job, input_path = start_file_job(db, job_id)

        if not job:
            return

        root = etree.parse(input_path).getroot()
        data = {
            root.tag: element_to_data(root)
        }

        output_path = outputs_dir() / f"xml_to_json_{job_id}.json"

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        complete_job(db, job, output_path)

    except Exception as e:
        fail_job(db, job, "XML To JSON", job_id, e)

    finally:
        db.close()
