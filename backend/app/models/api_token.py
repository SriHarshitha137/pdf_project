from sqlalchemy import (Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
    
)

from sqlalchemy.orm import relationship
from datetime import datetime, UTC

from app.db.base import Base


class ApiToken(Base):
    __tablename__ = "api_tokens"

    id = Column(Integer, primary_key=True)
    token_hash = Column(String, nullable=False)
    name = Column(String)
    last_used_at = Column(DateTime)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC)
    )
    revoked = Column(
        Boolean,
        default=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship(
        "User",
        back_populates="api_tokens"
    )