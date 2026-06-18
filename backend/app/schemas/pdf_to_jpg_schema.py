from pydantic import BaseModel


class PdfToJpgRequest(BaseModel):
    file_id: int