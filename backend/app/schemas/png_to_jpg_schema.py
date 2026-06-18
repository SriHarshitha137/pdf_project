from pydantic import BaseModel


class PngToJpgRequest(BaseModel):
    file_id: int
