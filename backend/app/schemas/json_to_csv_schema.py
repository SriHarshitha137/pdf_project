from pydantic import BaseModel


class JsonToCsvRequest(BaseModel):
    file_id: int
