from pydantic import BaseModel

class PdfToExcelRequest(BaseModel):
    file_id: int