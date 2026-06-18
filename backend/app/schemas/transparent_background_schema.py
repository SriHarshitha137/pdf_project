from pydantic import BaseModel


class TransparentBackgroundRequest(BaseModel):
    file_id: int
