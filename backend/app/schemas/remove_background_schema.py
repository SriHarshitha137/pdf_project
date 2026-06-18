from pydantic import BaseModel


class RemoveBackgroundRequest(BaseModel):
    file_id: int
