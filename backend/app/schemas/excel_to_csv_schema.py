from pydantic import BaseModel


class ExcelToCsvRequest(BaseModel):
    file_id: int
