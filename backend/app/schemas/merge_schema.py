from pydantic import BaseModel , Field

class MergeRequest(BaseModel):
    file_ids: list[int]  = Field(
        min_length=2
    )