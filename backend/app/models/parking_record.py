from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class ParkingRecord(Base):

    __tablename__ = "parking_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False
    )

    slot_id = Column(
        Integer,
        ForeignKey("parking_slots.id", ondelete="CASCADE"),
        nullable=False
    )

    entry_time = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    exit_time = Column(
        DateTime,
        nullable=True
    )