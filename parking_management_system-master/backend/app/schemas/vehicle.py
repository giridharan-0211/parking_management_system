from pydantic import BaseModel, ConfigDict
from datetime import datetime


class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    owner_name: str
    contact_number: str
    assigned_slot_id: int | None = None


class VehicleUpdate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    owner_name: str
    contact_number: str
    assigned_slot_id: int | None = None


class VehicleResponse(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: str
    owner_name: str
    contact_number: str
    assigned_slot_id: int | None = None
    assigned_slot_number: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
