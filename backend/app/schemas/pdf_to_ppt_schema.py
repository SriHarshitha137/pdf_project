from pydantic import BaseModel


class PdfToPptRequest(BaseModel):
    file_id: int
    dpi: int = 200
