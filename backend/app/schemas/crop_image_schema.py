from pydantic import BaseModel


class CropImageRequest(BaseModel):
    file_id: int
    left: int
    top: int
    width: int
    height: int
