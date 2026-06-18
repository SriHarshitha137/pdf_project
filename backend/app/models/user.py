from sqlalchemy import Column,Integer, String , DateTime
from app.db.base import Base
from sqlalchemy.orm import relationship
from datetime import datetime,UTC


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    plan_type = Column(String, default="free")

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )

    jobs = relationship("Job",back_populates="user")
    files = relationship("File", back_populates="user")
    api_tokens = relationship( "ApiToken",back_populates="user")

    usage_logs = relationship("UsageLog",back_populates="user")