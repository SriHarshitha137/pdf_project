from pydantic import BaseModel


class JpgToPngRequest(BaseModel):
    file_id: int
