from pydantic import BaseModel


class ImageToTextRequest(BaseModel):
    file_id: int
    language: str = "eng"
