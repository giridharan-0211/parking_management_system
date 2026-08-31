from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.parking_slot import ParkingSlot

from app.schemas.parking_slot import (
    ParkingSlotCreate,
    ParkingSlotUpdate,
    ParkingSlotResponse
)


router = APIRouter(
    prefix="/parking-slots",
    tags=["Parking Slots"]
)


# CREATE

@router.post("/", response_model=ParkingSlotResponse)
def create_parking_slot(
    slot: ParkingSlotCreate,
    db: Session = Depends(get_db)
):

    existing_slot = (
        db.query(ParkingSlot)
        .filter(ParkingSlot.slot_number == slot.slot_number)
        .first()
    )

    if existing_slot:
        raise HTTPException(
            status_code=400,
            detail="Slot number already exists"
        )

    new_slot = ParkingSlot(
        slot_number=slot.slot_number,
        status=slot.status
    )

    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return new_slot


# READ ALL

@router.get("/", response_model=list[ParkingSlotResponse])
def get_parking_slots(
    db: Session = Depends(get_db)
):

    slots = db.query(ParkingSlot).all()

    return slots


# READ ONE

@router.get("/{slot_id}", response_model=ParkingSlotResponse)
def get_parking_slot(
    slot_id: int,
    db: Session = Depends(get_db)
):

    slot = (
        db.query(ParkingSlot)
        .filter(ParkingSlot.id == slot_id)
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )

    return slot


# UPDATE

@router.put("/{slot_id}", response_model=ParkingSlotResponse)
def update_parking_slot(
    slot_id: int,
    slot_data: ParkingSlotUpdate,
    db: Session = Depends(get_db)
):

    slot = (
        db.query(ParkingSlot)
        .filter(ParkingSlot.id == slot_id)
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )

    slot.slot_number = slot_data.slot_number
    slot.status = slot_data.status

    db.commit()
    db.refresh(slot)

    return slot


# DELETE

@router.delete("/{slot_id}")
def delete_parking_slot(
    slot_id: int,
    db: Session = Depends(get_db)
):

    slot = (
        db.query(ParkingSlot)
        .filter(ParkingSlot.id == slot_id)
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found"
        )

    db.delete(slot)
    db.commit()

    return {
        "message": "Parking slot deleted successfully"
    }