from pydantic import BaseModel


class Azw3ToPdfRequest(BaseModel):
    file_id: int
