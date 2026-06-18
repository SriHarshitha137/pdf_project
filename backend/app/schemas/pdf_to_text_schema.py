from pydantic import BaseModel

class PdfToTextRequest(BaseModel):
    file_id: int