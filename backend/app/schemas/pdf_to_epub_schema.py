from pydantic import BaseModel


class PdfToEpubRequest(BaseModel):
    file_id: int
