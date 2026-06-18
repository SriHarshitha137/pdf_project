from pydantic import BaseModel


class AIRewriteRequest(BaseModel):
    file_id: int
    tone: str