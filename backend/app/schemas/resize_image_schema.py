from pydantic import BaseModel


class ResizeImageRequest(BaseModel):
    file_id: int
    width: int
    height: int
