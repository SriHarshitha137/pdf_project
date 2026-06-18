from pydantic import BaseModel


class ScreenshotToTextRequest(BaseModel):
    file_id: int
    language: str = "eng"
