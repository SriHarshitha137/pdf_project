from pydantic import BaseModel


class DownscaleImageRequest(BaseModel):
    file_id: int
    max_width: int
    max_height: int
