from pydantic import BaseModel


class ImageToCartoonRequest(BaseModel):
    file_id: int
