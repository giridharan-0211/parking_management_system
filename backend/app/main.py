from fastapi import FastAPI
from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.models import User, Vehicle, ParkingSlot, ParkingRecord

from app.routers.vehicle import router as vehicle_router
from app.routers.parking_slot import router as parking_slot_router
from app.routers.parking_record import router as parking_router


app = FastAPI(
    title="Parking Management System API",
    description="Backend API for Parking Management System",
    version="1.0.0"
)


# Include Vehicle APIs

app.include_router(vehicle_router)

# Include Parking Slot APIs
app.include_router(parking_slot_router)

# Include Parking APIs
app.include_router(parking_router)


@app.on_event("startup")
def create_default_parking_slots():
    """Create the standard A-01 to J-10 slots when they are missing."""

    Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE parking_slots "
                "ADD COLUMN IF NOT EXISTS is_archived "
                "BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE vehicles "
                "ADD COLUMN IF NOT EXISTS assigned_slot_id INTEGER"
            )
        )

    default_slot_numbers = [
        f"{row}-{number:02d}"
        for row in "ABCDEFGHIJ"
        for number in range(1, 11)
    ]

    db = SessionLocal()

    try:
        existing_slot_numbers = {
            slot_number
            for (slot_number,) in (
                db.query(ParkingSlot.slot_number)
                .filter(ParkingSlot.slot_number.in_(default_slot_numbers))
                .all()
            )
        }

        missing_slots = [
            ParkingSlot(slot_number=slot_number, status="Available")
            for slot_number in default_slot_numbers
            if slot_number not in existing_slot_numbers
        ]

        if missing_slots:
            db.add_all(missing_slots)
            db.commit()

    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Parking Management System API is running"
    }


@app.get("/test-db")
def test_database():

    try:
        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT current_database();")
            )

            database_name = result.scalar()

        return {
            "status": "success",
            "database": database_name
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }
