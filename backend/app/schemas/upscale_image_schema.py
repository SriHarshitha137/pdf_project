from pydantic import BaseModel


class UpscaleImageRequest(BaseModel):
    file_id: int
    scale: int = 2
    model: str = "general"
