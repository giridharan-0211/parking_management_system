# Parking Management System

A web-based Parking Management System for managing vehicles, parking slots, vehicle entry/exit, and parking history.

## Features

- Admin login interface
- Vehicle management
  - Add, view, update, and delete vehicles
- Parking slot management
  - Add, view, update, and delete parking slots
- Vehicle entry and exit tracking
- Automatic parking-slot status updates
- Parking history and dashboard statistics
- REST API documentation through FastAPI Swagger UI

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy

## Project Structure

```text
parking_management_system-main/
├── backend/
│   └── app/
│       ├── models/          # SQLAlchemy database models
│       ├── routers/         # API route handlers
│       ├── schemas/         # Pydantic request/response schemas
│       ├── database.py      # Database configuration
│       └── main.py          # FastAPI application entry point
├── frontend/
│   ├── assets/              # Images and other static assets
│   ├── css/                 # Stylesheets
│   ├── js/                  # Frontend JavaScript
│   ├── pages/               # Dashboard and management pages
│   └── index .html          # Login page
└── .gitignore
