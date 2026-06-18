from pydantic import BaseModel

class SplitRequest(BaseModel):
    file_id: int