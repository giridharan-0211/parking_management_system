from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine
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