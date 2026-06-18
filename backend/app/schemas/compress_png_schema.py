from pydantic import BaseModel


class CompressPngRequest(BaseModel):
    file_id: int
