from pydantic import BaseModel


class PdfToPngRequest(BaseModel):
    file_id: int
    dpi: int = 200
