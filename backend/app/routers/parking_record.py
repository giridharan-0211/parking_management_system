from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parking_record import ParkingRecord
from app.models.vehicle import Vehicle
from app.models.parking_slot import ParkingSlot

from app.schemas.parking_record import (
    ParkingEntryCreate,
    ParkingExitCreate,
    ParkingRecordResponse
)


router = APIRouter(
    prefix="/parking",
    tags=["Parking"]
)

# VEHICLE ENTRY


@router.post(
    "/entry",
    response_model=ParkingRecordResponse
)
def vehicle_entry(
    entry_data: ParkingEntryCreate,
    db: Session = Depends(get_db)
):

    # 1. Check whether the vehicle exists
    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == entry_data.vehicle_id)
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    # 2. Check whether the parking slot exists
    slot = (
        db.query(ParkingSlot)
        .filter(ParkingSlot.id == entry_data.slot_id)
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )

    if slot.is_archived:
        raise HTTPException(
            status_code=400,
            detail="Parking slot is archived"
        )

    # 3. Check whether the slot is available
    if slot.status.lower() != "available":
        raise HTTPException(
            status_code=400,
            detail="Parking slot is already occupied"
        )

    # 4. Check whether the vehicle is already parked
    active_record = (
        db.query(ParkingRecord)
        .filter(
            ParkingRecord.vehicle_id == entry_data.vehicle_id,
            ParkingRecord.exit_time.is_(None)
        )
        .first()
    )

    if active_record:
        raise HTTPException(
            status_code=400,
            detail="Vehicle is already parked"
        )

    # 5. Create a new parking record
    parking_record = ParkingRecord(
        vehicle_id=entry_data.vehicle_id,
        slot_id=entry_data.slot_id,
        entry_time=datetime.utcnow()
    )

    db.add(parking_record)

    # 6. Change parking slot status
    slot.status = "Occupied"

    # 7. Save changes to PostgreSQL
    db.commit()

    # 8. Refresh the parking record
    db.refresh(parking_record)

    return parking_record


# VEHICLE EXIT


@router.post(
    "/exit",
    response_model=ParkingRecordResponse
)
def vehicle_exit(
    exit_data: ParkingExitCreate,
    db: Session = Depends(get_db)
):

    # 1. Find the vehicle's active parking record
    parking_record = (
        db.query(ParkingRecord)
        .filter(
            ParkingRecord.vehicle_id == exit_data.vehicle_id,
            ParkingRecord.exit_time.is_(None)
        )
        .first()
    )

    if not parking_record:
        raise HTTPException(
            status_code=404,
            detail="Vehicle is not currently parked"
        )

    # 2. Find the parking slot
    slot = (
        db.query(ParkingSlot)
        .filter(
            ParkingSlot.id == parking_record.slot_id
        )
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )

    # 3. Record the exit time
    parking_record.exit_time = datetime.utcnow()

    # 4. Make the parking slot available again
    slot.status = "Available"

    # 5. Save changes to PostgreSQL
    db.commit()

    # 6. Refresh the parking record
    db.refresh(parking_record)

    return parking_record



# PARKING HISTORY


@router.get(
    "/records",
    response_model=list[ParkingRecordResponse]
)
def get_parking_records(
    db: Session = Depends(get_db)
):

    records = (
        db.query(ParkingRecord, Vehicle, ParkingSlot)
        .join(Vehicle, ParkingRecord.vehicle_id == Vehicle.id)
        .join(ParkingSlot, ParkingRecord.slot_id == ParkingSlot.id)
        .order_by(ParkingRecord.entry_time.desc())
        .all()
    )

    return [
        {
            "id": record.id,
            "vehicle_id": record.vehicle_id,
            "slot_id": record.slot_id,
            "entry_time": record.entry_time,
            "exit_time": record.exit_time,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "owner_name": vehicle.owner_name,
            "contact_number": vehicle.contact_number,
            "slot_number": slot.slot_number
        }
        for record, vehicle, slot in records
    ]
