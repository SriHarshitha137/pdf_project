from celery import Celery

celery_app = Celery(
    "pdfkit",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.imports = (
    "app.workers.merge",
    "app.workers.split",
    "app.workers.jpg_to_pdf",
    "app.workers.rotate",
    "app.workers.watermark",
    "app.workers.page_numbers",
    "app.workers.protect",
    "app.workers.unlock",
    "app.workers.pdf_to_jpg",
    "app.workers.compress",
    "app.workers.ai_summarise",
    "app.workers.ai_translate",
    "app.workers.ai_rewrite",
    "app.workers.qr_pdf",
    "app.workers.organize",
    "app.workers.ocr",
    "app.workers.pdf_to_word",
    "app.workers.word_to_pdf",
    "app.workers.sign_pdf",
    "app.workers.excel_to_pdf",
    "app.workers.ppt_to_pdf",
    "app.workers.pdf_to_excel",
    "app.workers.qr_generator",
)