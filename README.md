# Parking Management System

A full-stack web application for managing vehicle entries, exits, slot availability, and parking records through RESTful APIs and a responsive web interface.

# LIVE PARKING MANAGEMENT SYSTEM
https://parking-management-system-1-q72b.onrender.com/

## Overview

The Parking Management System streamlines parking lot operations by tracking incoming and outgoing vehicles, managing slot status, and persisting parking logs in a relational database. Built with **Python** and **FastAPI** on the backend paired with **HTML5**, **CSS3**, and **JavaScript** on the frontend.

## Key Features

- **Real-Time Vehicle Entry & Exit Tracking:** Log vehicle check-ins and check-outs with timestamps and slot assignments.
- **Slot & Parking Record Management:** Full CRUD operations for vehicles, parking slots, and session records.
- **RESTful API Endpoints:** Clean backend endpoints documented and testable via Swagger UI (`/docs`) and ReDoc (`/redoc`).
- **Interactive Frontend:** Web interface built with HTML, CSS, and JavaScript to view availability and manage entries.

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **Database:** SQL (PostgreSQL / MySQL)
- **Frontend:** HTML5, CSS3, JavaScript
- **API Testing & Tooling:** Swagger UI, Postman, Git, GitHub

## Project Structure

```text
parking_management_system/
├── app/                # FastAPI application, routes, schemas, and models (update to match your layout)
├── static/             # CSS and JavaScript assets (if applicable)
├── templates/          # HTML templates (if applicable)
├── requirements.txt    # Python dependencies
└── README.md
```

## Local Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/giridharan-0211/parking_management_system.git](https://github.com/giridharan-0211/parking_management_system.git)
   cd parking_management_system
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv venv
   # Windows (Command Prompt / PowerShell)
   venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database & environment variables:**

   Set up your SQL database (such as PostgreSQL or MySQL) and configure your database connection URL or credentials (e.g., via environment variables or a `.env` file, depending on how your app loads config).

5. **Run the FastAPI server:**

   ```bash
   uvicorn <your_entrypoint_module>:app --reload
   ```

   Replace `<your_entrypoint_module>` with your actual module path (for example, `main` or `app.main`).

6. **Explore the API & Web App:**

   - **Application:** `http://127.0.0.1:8000`
   - **Swagger UI:** `http://127.0.0.1:8000/docs`

## Author

**Giridharan Kumaresan** — GitHub: [@giridharan-0211](https://github.com/giridharan-0211)
