// =====================================================
// PARKING MANAGEMENT SYSTEM - FRONTEND JAVASCRIPT
// =====================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =====================================================
// LOGIN FUNCTIONALITY
// =====================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        const loginMessage = document.getElementById("loginMessage");

        if (username === "" || password === "") {

            loginMessage.textContent =
                "Please enter username and password.";

            return;
        }

        if (username === "admin" && password === "admin123") {

            loginMessage.textContent = "Login successful!";

            setTimeout(function () {

                window.location.href = "pages/dashboard.html";

            }, 500);

        } else {

            loginMessage.textContent =
                "Invalid username or password.";

        }

    });

}


// =====================================================
// DASHBOARD - PARKING SLOT STATISTICS
// =====================================================

async function updateDashboardStats() {

    const totalSlotsElement =
        document.getElementById("totalSlots");

    const availableSlotsElement =
        document.getElementById("availableSlots");

    const occupiedSlotsElement =
        document.getElementById("occupiedSlots");

    const parkedVehiclesElement =
        document.getElementById("parkedVehicles");


    if (
        !totalSlotsElement ||
        !availableSlotsElement ||
        !occupiedSlotsElement ||
        !parkedVehiclesElement
    ) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/parking-slots/`
        );

        if (!response.ok) {

            throw new Error(
                `Failed to fetch parking slots. Status: ${response.status}`
            );

        }

        const parkingSlots = await response.json();

        console.log("Parking slots received:", parkingSlots);


        const totalSlots = parkingSlots.length;


        const occupiedSlots = parkingSlots.filter(function (slot) {

            return String(slot.status).toLowerCase() === "occupied";

        }).length;


        const availableSlots = parkingSlots.filter(function (slot) {

            return String(slot.status).toLowerCase() === "available";

        }).length;


        totalSlotsElement.textContent = totalSlots;

        availableSlotsElement.textContent = availableSlots;

        occupiedSlotsElement.textContent = occupiedSlots;

        parkedVehiclesElement.textContent = occupiedSlots;


    } catch (error) {

        console.error(
            "Error loading dashboard statistics:",
            error
        );

        totalSlotsElement.textContent = "0";
        availableSlotsElement.textContent = "0";
        occupiedSlotsElement.textContent = "0";
        parkedVehiclesElement.textContent = "0";
    }

}


// =====================================================
// DASHBOARD - RECENT PARKING ACTIVITY
// =====================================================

async function loadRecentParkingActivity() {

    const tableBody = document.querySelector(
        ".dashboard-section tbody"
    );


    // If the table doesn't exist,
    // don't run this function.
    if (!tableBody) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/parking/records`
        );


        if (!response.ok) {

            throw new Error(
                `Failed to fetch parking records. Status: ${response.status}`
            );

        }


        const records = await response.json();

        console.log("Parking records received:", records);


        // Clear existing hard-coded rows
        tableBody.innerHTML = "";


        // If there are no records
        if (records.length === 0) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td colspan="6" style="text-align: center;">
                    No parking activity found.
                </td>
            `;

            tableBody.appendChild(row);

            return;
        }


        // Show latest records first
        const recentRecords = records.slice(-10).reverse();


        recentRecords.forEach(function (record) {

            const row = document.createElement("tr");


            // Vehicle number
            const vehicleNumber =
                record.vehicle_number ||
                record.vehicle?.vehicle_number ||
                "-";


            // Vehicle type
            const vehicleType =
                record.vehicle_type ||
                record.vehicle?.vehicle_type ||
                "-";


            // Parking slot
            const parkingSlot =
                record.slot_number ||
                record.parking_slot ||
                record.slot?.slot_number ||
                "-";


            // Entry time
            const entryTime =
                record.entry_time ||
                "-";


            // Exit time
            const exitTime =
                record.exit_time ||
                "-";


            // Determine status
            const status =
                record.exit_time ? "Exited" : "Parked";


            const statusClass =
                record.exit_time ? "available" : "occupied";


            row.innerHTML = `
                <td>${vehicleNumber}</td>

                <td>${vehicleType}</td>

                <td>${parkingSlot}</td>

                <td>${formatDateTime(entryTime)}</td>

                <td>${formatDateTime(exitTime)}</td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>
            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Error loading parking activity:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    Unable to load parking activity.
                </td>
            </tr>
        `;

    }

}


// =====================================================
// FORMAT DATE AND TIME
// =====================================================

function formatDateTime(dateTime) {

    if (!dateTime || dateTime === "-") {
        return "-";
    }


    try {

        const date = new Date(dateTime);


        if (isNaN(date.getTime())) {
            return dateTime;
        }


        return date.toLocaleString();

    } catch (error) {

        return dateTime;

    }

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

updateDashboardStats();

loadRecentParkingActivity();