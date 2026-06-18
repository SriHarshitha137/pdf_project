from pydantic import BaseModel


class ImageToSketchRequest(BaseModel):
    file_id: int
