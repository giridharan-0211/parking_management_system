from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class ParkingSlot(Base):

    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)

    slot_number = Column(
        String(20),
        unique=True,
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="Available"
    )

    is_archived = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
