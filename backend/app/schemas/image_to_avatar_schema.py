from pydantic import BaseModel


class ImageToAvatarRequest(BaseModel):
    file_id: int
