from pydantic import BaseModel


class CompressWebpRequest(BaseModel):
    file_id: int
    quality: int = 75
