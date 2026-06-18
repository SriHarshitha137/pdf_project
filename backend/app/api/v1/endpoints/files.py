from fastapi import APIRouter, UploadFile, Depends, HTTPException
from pathlib import Path
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.file import File
from app.models.user import User
from app.core.security import get_current_user

from app.services.cloudinary_storage import upload_file as upload_to_cloudinary


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)


@router.post("/upload")
async def upload_file(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file_path = UPLOAD_DIR / file.filename

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    cloudinary_url = upload_to_cloudinary(
        str(file_path)
    )

    db_file = File(
        user_id=current_user.id,
        original_filename=file.filename,
        s3_key=cloudinary_url,
        size_bytes=len(content),
        mime_type=file.content_type
    )

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {
        "file_id": db_file.id,
        "filename": db_file.original_filename,
        "file_url": cloudinary_url
    }


@router.get("/{file_id}")
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    db_file = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == current_user.id
        )
        .first()
    )

    if not db_file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return {
        "file_id": db_file.id,
        "filename": db_file.original_filename,
        "file_url": db_file.s3_key,
        "owner": (
            db_file.user.email
            if db_file.user
            else None
        )
    }