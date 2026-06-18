from pydantic import BaseModel


class QRPdfRequest(BaseModel):
    file_id: int
    url: str