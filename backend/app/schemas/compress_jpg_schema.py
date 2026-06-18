from pydantic import BaseModel


class CompressJpgRequest(BaseModel):
    file_id: int
    quality: int = 75
