from sqlalchemy import Column, Integer, String ,ForeignKey, DateTime,JSON
from sqlalchemy.orm import relationship
from datetime import datetime, UTC

from app.db.base import Base

class Job(Base):
    __tablename__ ="jobs"

    id = Column(Integer, primary_key=True)
    tool_name = Column(String)
    status = Column(String,
                    default="queued")
    
    input_file_key = Column(String)
    output_file_key = Column(String)
    error_message = Column(String)
    options = Column(JSON)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC)
    )
    completed_at = Column(DateTime)
    file_id = Column(Integer,ForeignKey("files.id"))
    user_id = Column(Integer , ForeignKey("users.id"))

    user = relationship("User", back_populates="jobs")
