from pydantic import BaseModel


class HandwritingToTextRequest(BaseModel):
    file_id: int
    language: str = "en"
