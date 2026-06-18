from sqlalchemy import Column, Integer, String , ForeignKey,DateTime
from app.db.base import Base
from sqlalchemy.orm import relationship
from datetime import datetime, UTC

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True)
    original_filename = Column(String)
    s3_key = Column(String)
    size_bytes = Column(Integer)
    mime_type = Column(String)
    expires_at = Column(DateTime)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC)
    )
    
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="files")