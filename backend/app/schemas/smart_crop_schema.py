from pydantic import BaseModel


class SmartCropRequest(BaseModel):
    file_id: int
    width: int
    height: int
