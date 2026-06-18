from pydantic import BaseModel


class EpubToPdfRequest(BaseModel):
    file_id: int
