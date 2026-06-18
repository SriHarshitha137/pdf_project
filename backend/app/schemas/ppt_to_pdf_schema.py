from pydantic import BaseModel

class PptToPdfRequest(BaseModel):
    file_id: int