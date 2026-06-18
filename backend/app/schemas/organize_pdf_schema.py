from pydantic import BaseModel

class OrganizePdfRequest(BaseModel):
    file_id: int
    page_order: list[int]