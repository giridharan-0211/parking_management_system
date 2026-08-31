from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vehicle import Vehicle
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

    existing_vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.vehicle_number == vehicle.vehicle_number)
        .first()
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle number already exists"
        )

    new_vehicle = Vehicle(
        vehicle_number=vehicle.vehicle_number,
        vehicle_type=vehicle.vehicle_type,
        owner_name=vehicle.owner_name,
        contact_number=vehicle.contact_number
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle


# READ ALL

@router.get("/", response_model=list[VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db)
):

    vehicles = db.query(Vehicle).all()

    return vehicles


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

    vehicle.vehicle_number = vehicle_data.vehicle_number
    vehicle.vehicle_type = vehicle_data.vehicle_type
    vehicle.owner_name = vehicle_data.owner_name
    vehicle.contact_number = vehicle_data.contact_number

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