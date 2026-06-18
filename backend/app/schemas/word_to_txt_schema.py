from pydantic import BaseModel


class WordToTxtRequest(BaseModel):
    file_id: int
