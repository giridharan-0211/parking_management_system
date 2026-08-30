from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ParkingSlotCreate(BaseModel):
    slot_number: str
    status: str = "Available"


class ParkingSlotUpdate(BaseModel):
    slot_number: str
    status: str


class ParkingSlotResponse(BaseModel):
    id: int
    slot_number: str
    status: str
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)