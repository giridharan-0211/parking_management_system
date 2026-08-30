from pydantic import BaseModel
from datetime import datetime


class ParkingEntryCreate(BaseModel):
    vehicle_id: int
    slot_id: int


class ParkingExitCreate(BaseModel):
    vehicle_id: int


class ParkingRecordResponse(BaseModel):
    id: int
    vehicle_id: int
    slot_id: int
    entry_time: datetime
    exit_time: datetime | None = None

    class Config:
        from_attributes = True