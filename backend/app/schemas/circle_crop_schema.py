from pydantic import BaseModel


class CircleCropRequest(BaseModel):
    file_id: int
