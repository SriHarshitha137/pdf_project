from pydantic import BaseModel


class WatermarkRequest(BaseModel):
    file_id: int
    text: str