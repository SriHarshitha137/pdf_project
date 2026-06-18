from pydantic import BaseModel


class XmlToJsonRequest(BaseModel):
    file_id: int
