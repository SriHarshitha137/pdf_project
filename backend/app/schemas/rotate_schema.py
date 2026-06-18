from pydantic import BaseModel


class RotateRequest(BaseModel):
    file_id: int
    rotation: int