from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from datetime import datetime, UTC

from app.db.base import Base


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True)
    tool_name = Column(String)
    file_size_bytes = Column(Integer)
    processing_time_ms = Column(Integer)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC)
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship(
        "User",
        back_populates="usage_logs"
    )