from pydantic import BaseModel


class WordToHtmlRequest(BaseModel):
    file_id: int
