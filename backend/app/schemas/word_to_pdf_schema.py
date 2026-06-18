from pydantic import BaseModel

class WordToPdfRequest(BaseModel):
    file_id: int