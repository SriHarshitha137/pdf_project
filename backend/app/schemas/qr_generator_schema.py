from pydantic import BaseModel

class QrGeneratorRequest(BaseModel):
    url: str