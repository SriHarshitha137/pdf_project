from pydantic import BaseModel


class JobCreate(BaseModel):
    file_id: int
    tool_name: str


class JobResponse(BaseModel):
    id: int
    status: str
    tool_name: str

    model_config = {
        "from_attributes": True
    }