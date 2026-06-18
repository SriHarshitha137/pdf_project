from pydantic import BaseModel


class WordToMarkdownRequest(BaseModel):
    file_id: int
