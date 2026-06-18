from pydantic import BaseModel


class PageNumbersRequest(BaseModel):
    file_id: int