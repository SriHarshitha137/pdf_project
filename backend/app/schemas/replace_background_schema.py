from pydantic import BaseModel


class ReplaceBackgroundRequest(BaseModel):
    file_id: int
    background_color: str = "#ffffff"
