from pydantic import BaseModel


class UnlockRequest(BaseModel):
    file_id: int
    password: str