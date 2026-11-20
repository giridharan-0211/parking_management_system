from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.parking_slot import ParkingSlot
from app.models.parking_record import ParkingRecord
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse
)


router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


# CREATE

@router.post("/", response_model=VehicleResponse)
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db)
):

    vehicle_number = vehicle.vehicle_number.strip().upper()

    existing_vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.vehicle_number == vehicle_number)
        .first()
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle number already exists"
        )

    if vehicle.assigned_slot_id is not None:
        assigned_slot = (
            db.query(ParkingSlot)
            .filter(ParkingSlot.id == vehicle.assigned_slot_id)
            .first()
        )

        if (
            not assigned_slot or
            assigned_slot.is_archived or
            assigned_slot.status.lower() != "available"
        ):
            raise HTTPException(
                status_code=400,
                detail="Selected parking slot is unavailable"
            )

        assigned_vehicle = (
            db.query(Vehicle)
            .filter(Vehicle.assigned_slot_id == vehicle.assigned_slot_id)
            .first()
        )

        if assigned_vehicle:
            raise HTTPException(
                status_code=400,
                detail="Selected parking slot is already assigned to another vehicle"
            )

    new_vehicle = Vehicle(
        vehicle_number=vehicle_number,
        vehicle_type=vehicle.vehicle_type,
        owner_name=vehicle.owner_name,
        contact_number=vehicle.contact_number,
        assigned_slot_id=vehicle.assigned_slot_id
    )

    db.add(new_vehicle)
    db.flush()

    if vehicle.assigned_slot_id is not None:
        parking_record = ParkingRecord(
            vehicle_id=new_vehicle.id,
            slot_id=vehicle.assigned_slot_id,
            entry_time=datetime.utcnow()
        )

        db.add(parking_record)
        assigned_slot.status = "Occupied"

    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle


# READ ALL

@router.get("/", response_model=list[VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db)
):

    vehicles = (
        db.query(Vehicle, ParkingSlot)
        .outerjoin(ParkingSlot, Vehicle.assigned_slot_id == ParkingSlot.id)
        .all()
    )

    return [
        {
            "id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "owner_name": vehicle.owner_name,
            "contact_number": vehicle.contact_number,
            "assigned_slot_id": vehicle.assigned_slot_id,
            "assigned_slot_number": (
                assigned_slot.slot_number if assigned_slot else None
            ),
            "created_at": vehicle.created_at
        }
        for vehicle, assigned_slot in vehicles
    ]


# READ ONE

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return vehicle


# UPDATE

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdate,
    db: Session = Depends(get_db)
):

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    vehicle.vehicle_number = vehicle_data.vehicle_number.strip().upper()
    vehicle.vehicle_type = vehicle_data.vehicle_type
    vehicle.owner_name = vehicle_data.owner_name
    vehicle.contact_number = vehicle_data.contact_number
    vehicle.assigned_slot_id = vehicle_data.assigned_slot_id

    db.commit()
    db.refresh(vehicle)

    return vehicle


# DELETE

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    db.delete(vehicle)
    db.commit()

    return {
        "message": "Vehicle deleted successfully"
    }
