from pydantic import BaseModel

class ExcelToPdfRequest(BaseModel):
    file_id: int
    