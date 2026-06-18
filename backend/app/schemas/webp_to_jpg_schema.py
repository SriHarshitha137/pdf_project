from pydantic import BaseModel


class WebpToJpgRequest(BaseModel):
    file_id: int
