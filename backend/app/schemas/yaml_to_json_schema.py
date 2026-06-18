from pydantic import BaseModel


class YamlToJsonRequest(BaseModel):
    file_id: int
