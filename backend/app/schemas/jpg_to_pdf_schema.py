from pydantic import BaseModel


class JpgToPdfRequest(BaseModel):
    file_ids: list[int]