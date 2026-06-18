from pydantic import BaseModel

class PdfToWordRequest(BaseModel):
    file_id:int