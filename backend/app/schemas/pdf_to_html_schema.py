from pydantic import BaseModel


class PdfToHtmlRequest(BaseModel):
    file_id: int
