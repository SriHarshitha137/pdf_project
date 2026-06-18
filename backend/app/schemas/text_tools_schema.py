from pydantic import BaseModel


class TextToolRequest(BaseModel):
    text: str
