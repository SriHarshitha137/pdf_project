from pydantic import BaseModel


class JsonToXmlRequest(BaseModel):
    file_id: int
