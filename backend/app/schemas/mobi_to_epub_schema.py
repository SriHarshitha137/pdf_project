from pydantic import BaseModel


class MobiToEpubRequest(BaseModel):
    file_id: int
