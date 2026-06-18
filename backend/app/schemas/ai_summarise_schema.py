from pydantic import BaseModel


class AISummariseRequest(BaseModel):
    file_id: int