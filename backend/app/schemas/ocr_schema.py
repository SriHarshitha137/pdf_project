from pydantic import BaseModel

class OCRRequest(BaseModel):
    file_id: int
    language: str = "eng"