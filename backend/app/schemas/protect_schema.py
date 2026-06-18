from pydantic import BaseModel


class ProtectRequest(BaseModel):
    file_id: int
    password: str