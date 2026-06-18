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
from app.api.v1.endpoints.pdf_to_text import (
    router as pdf_to_text_router
)
from app.api.v1.endpoints.excel_to_csv import (
    router as excel_to_csv_router
)
from app.api.v1.endpoints.excel_to_json import (
    router as excel_to_json_router
)
from app.api.v1.endpoints.word_to_txt import (
    router as word_to_txt_router
)
from app.api.v1.endpoints.word_to_html import (
    router as word_to_html_router
)
from app.api.v1.endpoints.word_to_markdown import (
    router as word_to_markdown_router
)
from app.api.v1.endpoints.jpg_to_png import (
    router as jpg_to_png_router
)
from app.api.v1.endpoints.png_to_jpg import (
    router as png_to_jpg_router
)
from app.api.v1.endpoints.png_to_webp import (
    router as png_to_webp_router
)
from app.api.v1.endpoints.webp_to_jpg import (
    router as webp_to_jpg_router
)
from app.api.v1.endpoints.json_to_csv import (
    router as json_to_csv_router
)
from app.api.v1.endpoints.csv_to_json import (
    router as csv_to_json_router
)
from app.api.v1.endpoints.pdf_to_png import (
    router as pdf_to_png_router
)
from app.api.v1.endpoints.pdf_to_html import (
    router as pdf_to_html_router
)
from app.api.v1.endpoints.ppt_to_images import (
    router as ppt_to_images_router
)
from app.api.v1.endpoints.image_to_text import (
    router as image_to_text_router
)
from app.api.v1.endpoints.screenshot_to_text import (
    router as screenshot_to_text_router
)
from app.api.v1.endpoints.pdf_to_epub import (
    router as pdf_to_epub_router
)
from app.api.v1.endpoints.json_to_xml import (
    router as json_to_xml_router
)
from app.api.v1.endpoints.xml_to_json import (
    router as xml_to_json_router
)
from app.api.v1.endpoints.yaml_to_json import (
    router as yaml_to_json_router
)
from app.api.v1.endpoints.text_tools import (
    router as text_tools_router
)
from app.api.v1.endpoints.compress_jpg import (
    router as compress_jpg_router
)
from app.api.v1.endpoints.compress_png import (
    router as compress_png_router
)
from app.api.v1.endpoints.compress_webp import (
    router as compress_webp_router
)
from app.api.v1.endpoints.resize_image import (
    router as resize_image_router
)
from app.api.v1.endpoints.downscale_image import (
    router as downscale_image_router
)
from app.api.v1.endpoints.crop_image import (
    router as crop_image_router
)
from app.api.v1.endpoints.circle_crop import (
    router as circle_crop_router
)
from app.api.v1.endpoints.remove_background import (
    router as remove_background_router
)
from app.api.v1.endpoints.transparent_background import (
    router as transparent_background_router
)
from app.api.v1.endpoints.replace_background import (
    router as replace_background_router
)
from app.api.v1.endpoints.smart_crop import (
    router as smart_crop_router
)
from app.api.v1.endpoints.image_to_cartoon import (
    router as image_to_cartoon_router
)
from app.api.v1.endpoints.image_to_sketch import (
    router as image_to_sketch_router
)
from app.api.v1.endpoints.handwriting_to_text import (
    router as handwriting_to_text_router
)
from app.api.v1.endpoints.upscale_image import (
    router as upscale_image_router
)
from app.api.v1.endpoints.image_to_anime import (
    router as image_to_anime_router
)
from app.api.v1.endpoints.image_to_avatar import (
    router as image_to_avatar_router
)
from app.api.v1.endpoints.pdf_to_ppt import (
    router as pdf_to_ppt_router
)
from app.api.v1.endpoints.epub_to_pdf import (
    router as epub_to_pdf_router
)
from app.api.v1.endpoints.mobi_to_epub import (
    router as mobi_to_epub_router
)
from app.api.v1.endpoints.azw3_to_pdf import (
    router as azw3_to_pdf_router
)







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
router.include_router(page_numbers_router)
router.include_router(protect_router)
router.include_router(unlock_router)
router.include_router(pdf_to_jpg_router)
router.include_router(compress_router)
router.include_router(ai_summarise_router)
router.include_router(ai_translate_router)
router.include_router(ai_rewrite_router)
router.include_router(qr_pdf_router)
router.include_router(admin_router)
router.include_router(organize_router)
router.include_router(ocr_router)
router.include_router(pdf_to_word_router)
router.include_router(word_to_pdf_router)
router.include_router(sign_pdf_router)
router.include_router(excel_to_pdf_router)
router.include_router(ppt_to_pdf_router)
router.include_router(pdf_to_excel_router)
router.include_router(qr_generator_router)
router.include_router(pdf_to_text_router)
router.include_router(excel_to_csv_router)
router.include_router(excel_to_json_router)
router.include_router(word_to_txt_router)
router.include_router(word_to_html_router)
router.include_router(word_to_markdown_router)
router.include_router(jpg_to_png_router)
router.include_router(png_to_jpg_router)
router.include_router(png_to_webp_router)
router.include_router(webp_to_jpg_router)
router.include_router(json_to_csv_router)
router.include_router(csv_to_json_router)
router.include_router(pdf_to_png_router)
router.include_router(pdf_to_html_router)
router.include_router(ppt_to_images_router)
router.include_router(image_to_text_router)
router.include_router(screenshot_to_text_router)
router.include_router(pdf_to_epub_router)
router.include_router(json_to_xml_router)
router.include_router(xml_to_json_router)
router.include_router(yaml_to_json_router)
router.include_router(text_tools_router)
router.include_router(compress_jpg_router)
router.include_router(compress_png_router)
router.include_router(compress_webp_router)
router.include_router(resize_image_router)
router.include_router(downscale_image_router)
router.include_router(crop_image_router)
router.include_router(circle_crop_router)
router.include_router(remove_background_router)
router.include_router(transparent_background_router)
router.include_router(replace_background_router)
router.include_router(smart_crop_router)
router.include_router(image_to_cartoon_router)
router.include_router(image_to_sketch_router)
router.include_router(handwriting_to_text_router)
router.include_router(upscale_image_router)
router.include_router(image_to_anime_router)
router.include_router(image_to_avatar_router)
router.include_router(pdf_to_ppt_router)
router.include_router(epub_to_pdf_router)
router.include_router(mobi_to_epub_router)
router.include_router(azw3_to_pdf_router)
