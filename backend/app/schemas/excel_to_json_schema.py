from pydantic import BaseModel


class ExcelToJsonRequest(BaseModel):
    file_id: int
