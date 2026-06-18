from pydantic import BaseModel


class ImageToAnimeRequest(BaseModel):
    file_id: int
