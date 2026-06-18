from pydantic import BaseModel
from typing import Optional

class SignPdfRequest(BaseModel):
    pdf_file_id: int
    mode: str  

    signature_text: Optional[str] = None
    signature_file_id: Optional[int] = None

    certificate_file_id: Optional[int] = None
    password: Optional[str] = None

    page: int = 0
    x: float = 100
    y: float = 700