from pathlib import Path
from datetime import datetime, UTC

import fitz

from pyhanko.sign import signers
from pyhanko.pdf_utils.incremental_writer import (
    IncrementalPdfFileWriter
)

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.job import Job
from app.models.file import File
from app.services.file_downloader import download_file
from app.services.cloudinary_storage import upload_file


@celery_app.task
def sign_pdf_task(job_id: int):

    db = SessionLocal()
    job = None

    try:

        job = (
            db.query(Job)
            .filter(Job.id == job_id)
            .first()
        )

        if not job:
            return

        mode = job.options["mode"]
        pdf_file_id = job.options["pdf_file_id"]
        page_num = job.options.get("page", 0)
        x = job.options.get("x", 100)
        y = job.options.get("y", 700)

        job.status = "processing"
        db.commit()

        pdf_file = (
            db.query(File)
            .filter(File.id == pdf_file_id)
            .first()
        )

        if not pdf_file:
            raise Exception("PDF not found")

        pdf_path = download_file(pdf_file.s3_key)

        output_dir = Path("outputs")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"signed_{job_id}.pdf"

        if mode == "typed":

            signature_text = job.options["signature_text"]

            doc = fitz.open(pdf_path)
            page = doc[page_num]

            page.insert_text(
                (x, y),
                signature_text,
                fontsize=24,
                color=(0, 0, 0.6)
            )

            doc.save(str(output_path))
            doc.close()

        elif mode == "image":

            signature_file_id = job.options["signature_file_id"]

            sig_file = (
                db.query(File)
                .filter(File.id == signature_file_id)
                .first()
            )

            if not sig_file:
                raise Exception("Signature image not found")

            sig_path = download_file(sig_file.s3_key)

            doc = fitz.open(pdf_path)
            page = doc[page_num]

            rect = fitz.Rect(x, y, x + 200, y + 80)
            page.insert_image(rect, filename=sig_path)

            doc.save(str(output_path))
            doc.close()

        elif mode == "digital":

            certificate_file_id = job.options["certificate_file_id"]
            password = job.options["password"]

            cert_file = (
                db.query(File)
                .filter(File.id == certificate_file_id)
                .first()
            )

            if not cert_file:
                raise Exception("Certificate not found")

            cert_path = download_file(cert_file.s3_key)

            signer = (
                signers.SimpleSigner
                .load_pkcs12(
                    cert_path,
                    passphrase=password.encode()
                )
            )

            with open(pdf_path, "rb") as inf:
                writer = IncrementalPdfFileWriter(
                    inf,
                    strict=False
                )
                with open(output_path, "wb") as outf:
                    signers.sign_pdf(
                        writer,
                        signature_meta=signers.PdfSignatureMetadata(
                            field_name="Signature"
                        ),
                        signer=signer,
                        output=outf
                    )

        else:
            raise Exception(f"Unknown mode: {mode}")

        cloudinary_url = upload_file(str(output_path))

        job.output_file_key = cloudinary_url
        job.status = "completed"
        job.completed_at = datetime.now(UTC)
        db.commit()

    except Exception as e:

        print(f"Sign Job {job_id} Failed: {e}")

        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

    finally:
        db.close()