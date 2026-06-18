from pydantic import BaseModel


class PngToWebpRequest(BaseModel):
    file_id: int
