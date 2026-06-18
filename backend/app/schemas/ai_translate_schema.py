from pydantic import BaseModel


class AITranslateRequest(BaseModel):
    file_id: int
    target_language: str