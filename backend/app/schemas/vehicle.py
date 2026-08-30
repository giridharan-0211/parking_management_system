from pydantic import BaseModel, ConfigDict
from datetime import datetime


class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    owner_name: str
    contact_number: str


class VehicleUpdate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    owner_name: str
    contact_number: str


class VehicleResponse(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: str
    owner_name: str
    contact_number: str
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)