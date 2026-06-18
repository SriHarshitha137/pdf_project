from pydantic import BaseModel


class PptToImagesRequest(BaseModel):
    file_id: int
    dpi: int = 200
