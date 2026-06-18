from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints import files
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.merge import router as   merge_router
from app.api.v1.endpoints.split import router as split_router
from app.api.v1.endpoints.jpg_to_pdf import (router as jpg_to_pdf_router)
from app.api.v1.endpoints.rotate import ( router as rotate_router)
from app.api.v1.endpoints.watermark import (
    router as watermark_router
)
from app.api.v1.endpoints.page_numbers import (
    router as page_numbers_router
)
from app.api.v1.endpoints.protect import (
    router as protect_router
)
from app.api.v1.endpoints.unlock import (
    router as unlock_router
)
from app.api.v1.endpoints.pdf_to_jpg import (
    router as pdf_to_jpg_router
)
from app.api.v1.endpoints.compress import (
    router as compress_router
)
from app.api.v1.endpoints.ai_summarise import (
    router as ai_summarise_router
)
from app.api.v1.endpoints.ai_translate import (
    router as ai_translate_router
)
from app.api.v1.endpoints.ai_rewrite import (
    router as ai_rewrite_router
)
from app.api.v1.endpoints.qr_pdf import (
    router as qr_pdf_router
)
from app.api.v1.endpoints.admin import (
    router as admin_router
)
from app.api.v1.endpoints.organize import (
    router as organize_router
)
from app.api.v1.endpoints.ocr import (router as ocr_router)

from app.api.v1.endpoints.pdf_to_word import (router as pdf_to_word_router)
from app.api.v1.endpoints.word_to_pdf import (router as word_to_pdf_router)
from app.api.v1.endpoints.sign_pdf import (router as sign_pdf_router)
from app.api.v1.endpoints.excel_to_pdf import (
    router as excel_to_pdf_router
)
from app.api.v1.endpoints.ppt_to_pdf import (
    router as ppt_to_pdf_router )

from app.api.v1.endpoints.pdf_to_excel import (
    router as pdf_to_excel_router
)
from app.api.v1.endpoints.qr_generator import (
    router as qr_generator_router  )







router = APIRouter(
    prefix="/api/v1"
)


@router.get("/")
def home():
    return {"message":"pdfflow backend running"}

router.include_router(auth_router)
router.include_router(files.router)
router.include_router(jobs_router)
router.include_router(merge_router)
router.include_router(split_router)
router.include_router(jpg_to_pdf_router)
router.include_router(rotate_router)
router.include_router(watermark_router)
router.include_router(
    page_numbers_router
)
router.include_router(protect_router)
router.include_router(unlock_router)
router.include_router(pdf_to_jpg_router)
router.include_router(compress_router)
router.include_router(ai_summarise_router)
router.include_router(ai_translate_router)
router.include_router(ai_rewrite_router)
router.include_router(
    qr_pdf_router
)
router.include_router(
    admin_router
)
router.include_router(organize_router)
router.include_router(ocr_router)
router.include_router(pdf_to_word_router)
router.include_router(word_to_pdf_router)
router.include_router(sign_pdf_router)
router.include_router(excel_to_pdf_router)
router.include_router(ppt_to_pdf_router)
router.include_router(pdf_to_excel_router)
router.include_router(qr_generator_router)