from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class Vehicle(Base):

    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_number = Column(
        String(20),
        unique=True,
        nullable=False
    )

    vehicle_type = Column(
        String(20),
        nullable=False
    )

    owner_name = Column(
        String(100),
        nullable=False
    )

    contact_number = Column(
        String(15),
        nullable=False
    )

    assigned_slot_id = Column(
        Integer,
        ForeignKey("parking_slots.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
