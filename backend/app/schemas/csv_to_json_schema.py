from pydantic import BaseModel


class CsvToJsonRequest(BaseModel):
    file_id: int
