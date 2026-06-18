from pydantic import BaseModel, Field

class CompressRequest(BaseModel):

    file_id: int

    compression_percent: int = Field(
        ge=0,
        le=100
    )