// PARKING MANAGEMENT SYSTEM - FRONTEND JAVASCRIPT


const API_BASE_URL = "http://127.0.0.1:8000";



// LOGIN FUNCTIONALITY


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

        if (username === "satoryuzei" && password === "1979") {

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



// DASHBOARD - PARKING SLOT STATISTICS


async function updateDashboardStats() {

    const totalSlotsElement =
        document.getElementById("totalSlots");

    const availableSlotsElement =
        document.getElementById("availableSlots");

    const occupiedSlotsElement =
        document.getElementById("occupiedSlots");

    const parkedVehiclesElement =
        document.getElementById("parkedVehicles");

    const exitedVehiclesElement =
        document.getElementById("exitedVehicles");



    if (
        !totalSlotsElement ||
        !availableSlotsElement ||
        !occupiedSlotsElement ||
        !parkedVehiclesElement ||
        !exitedVehiclesElement
    ) {
        return;
    }


    try {

        const [response, recordsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/parking-slots/`),
            fetch(`${API_BASE_URL}/parking/records`)
        ]);

        if (!response.ok || !recordsResponse.ok) {

            throw new Error(
                `Failed to fetch parking slots. Status: ${response.status}`
            );

        }

        const parkingSlots = await response.json();
        const records = await recordsResponse.json();

        console.log("Parking slots received:", parkingSlots);


        const totalSlots = parkingSlots.length;


        const occupiedSlots = parkingSlots.filter(function (slot) {

            return String(slot.status).toLowerCase() === "occupied";

        }).length;


        const availableSlots = parkingSlots.filter(function (slot) {

            return String(slot.status).toLowerCase() === "available";

        }).length;

        const exitedVehicles = records.filter(function (record) {
            return record.exit_time !== null;
        }).length;

        totalSlotsElement.textContent = totalSlots;

        availableSlotsElement.textContent = availableSlots;

        occupiedSlotsElement.textContent = occupiedSlots;

        parkedVehiclesElement.textContent = occupiedSlots;

        exitedVehiclesElement.textContent = exitedVehicles;



    } catch (error) {

        console.error(
            "Error loading dashboard statistics:",
            error
        );

        totalSlotsElement.textContent = "0";
        availableSlotsElement.textContent = "0";
        occupiedSlotsElement.textContent = "0";
        parkedVehiclesElement.textContent = "0";
        exitedVehiclesElement.textContent = "0";
    }

}



// DASHBOARD - PARKING SLOT BOXES

let dashboardSlotFilter = "all";


function setDashboardSlotFilter(filter) {

    dashboardSlotFilter = filter;

    const dashboardSlotsPanel = document.getElementById("dashboardSlotsPanel");
    const dashboardSlotsTitle = document.getElementById("dashboardSlotsTitle");
    const parkedPanel = document.getElementById("parkedVehiclesPanel");
    const exitedPanel = document.getElementById("exitedVehiclesPanel");

    const dashboardSlotHeadings = {
        all: "Total Parking Slots",
        available: "Available Slots",
        occupied: "Occupied Slots"
    };
    const heading = dashboardSlotHeadings[filter] || dashboardSlotHeadings.all;

    if (dashboardSlotsPanel) {
        dashboardSlotsPanel.hidden = false;
    }

    if (dashboardSlotsTitle) {
        dashboardSlotsTitle.textContent = heading;
    }

    if (parkedPanel) {
        parkedPanel.hidden = true;
    }

    if (exitedPanel) {
        exitedPanel.hidden = true;
    }

    loadDashboardSlotGrid();

}


async function loadDashboardSlotGrid() {

    const slotGrid =
        document.getElementById("dashboardSlotGrid");

    if (!slotGrid) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/parking-slots/`
        );

        if (!response.ok) {
            throw new Error("Unable to load parking slots.");
        }

        const slots = await response.json();

        const filteredSlots = slots.filter(function (slot) {

            const status = String(slot.status).toLowerCase();

            if (dashboardSlotFilter === "available") {
                return status === "available" && !slot.is_archived;
            }

            if (dashboardSlotFilter === "occupied") {
                return status === "occupied" && !slot.is_archived;
            }

            return true;

        });

        slotGrid.innerHTML = "";

        if (filteredSlots.length === 0) {
            slotGrid.innerHTML = "<p>No matching parking slots found.</p>";
            return;
        }

        filteredSlots.forEach(function (slot) {

            const status = String(slot.status).toLowerCase();
            const isArchived = Boolean(slot.is_archived);
            const statusClass = isArchived
                ? "archived"
                : status === "occupied"
                    ? "occupied"
                    : "available";
            const displayedStatus = isArchived
                ? "Archived"
                : slot.status || "-";

            const slotBox = document.createElement("div");

            slotBox.className = `slot-box ${statusClass}`;
            slotBox.innerHTML = `
                <span class="slot-box-number">${slot.slot_number || "-"}</span>
                <span class="status-badge ${statusClass}">
                    ${displayedStatus}
                </span>
            `;

            slotGrid.appendChild(slotBox);

        });

    } catch (error) {

        console.error("Error loading dashboard slots:", error);
        slotGrid.innerHTML = "<p>Unable to load parking slots.</p>";

    }

}


async function showCurrentlyParked() {

    const dashboardSlotsPanel =
        document.getElementById("dashboardSlotsPanel");

    const parkedPanel =
        document.getElementById("parkedVehiclesPanel");

    const exitedPanel =
        document.getElementById("exitedVehiclesPanel");

    const parkedVehiclesGrid =
        document.getElementById("parkedVehiclesGrid");


    // Check required elements
    if (!parkedPanel || !parkedVehiclesGrid) {
        console.error("Parked vehicles panel not found.");
        return;
    }


    // Hide dashboard parking slots
    if (dashboardSlotsPanel) {
        dashboardSlotsPanel.hidden = true;
    }


    // Show parked vehicles panel
    parkedPanel.hidden = false;


    // Hide exited vehicles panel
    if (exitedPanel) {
        exitedPanel.hidden = true;
    }


    // Show loading message
    parkedVehiclesGrid.innerHTML =
        "<p>Loading currently parked vehicles...</p>";


    try {

        // Get parking records
        const response = await fetch(
            `${API_BASE_URL}/parking/records`
        );


        if (!response.ok) {
            throw new Error(
                `Parking records request failed: ${response.status}`
            );
        }


        const records = await response.json();


        console.log("Parking records:", records);


        // Get only vehicles that have NOT exited
        const activeRecords = records.filter(function (record) {

            return record.exit_time === null;

        });


        // Clear loading message
        parkedVehiclesGrid.innerHTML = "";


        // No active vehicles
        if (activeRecords.length === 0) {

            parkedVehiclesGrid.innerHTML =
                "<p>No vehicles are currently parked.</p>";

            return;
        }


        // Display every currently parked vehicle
        activeRecords.forEach(function (record, index) {

            const vehicleCard =
                document.createElement("div");


            vehicleCard.className =
                "parked-slot-item";


            vehicleCard.innerHTML = `

                <div class="parked-slot-details">

                    <p class="record-index">
                        Vehicle #${index + 1}
                    </p>

                    <p class="slot-number-label">
                        ${record.slot_number || "-"}
                    </p>

                    <p>
                        <strong>Vehicle:</strong>
                        ${record.vehicle_number || "-"}
                    </p>

                    <p>
                        <strong>Type:</strong>
                        ${record.vehicle_type || "-"}
                    </p>

                    <p>
                        <strong>Entry Time:</strong>
                        ${formatDateTime(record.entry_time)}
                    </p>

                </div>


                <div class="parked-slot-details parked-owner-details">

                    <p class="selected-slot-label">
                        Owner Details
                    </p>

                    <p>
                        <strong>Name:</strong>
                        ${record.owner_name || "-"}
                    </p>

                    <p>
                        <strong>Contact:</strong>
                        ${record.contact_number || "-"}
                    </p>

                </div>

            `;


            parkedVehiclesGrid.appendChild(vehicleCard);

        });


    } catch (error) {

        console.error(
            "Error loading currently parked vehicles:",
            error
        );


        parkedVehiclesGrid.innerHTML =
            "<p>Unable to load currently parked vehicles.</p>";

    }

}


async function showExitedVehicles() {

    const dashboardSlotsPanel = document.getElementById("dashboardSlotsPanel");
    const parkedPanel = document.getElementById("parkedVehiclesPanel");
    const exitedPanel = document.getElementById("exitedVehiclesPanel");
    const exitedVehiclesGrid = document.getElementById("exitedVehiclesGrid");

    dashboardSlotsPanel.hidden = true;
    parkedPanel.hidden = true;
    exitedPanel.hidden = false;
    exitedVehiclesGrid.innerHTML = "<p>Loading exited vehicle details...</p>";

    try {

        const response = await fetch(`${API_BASE_URL}/parking/records`);

        if (!response.ok) {
            throw new Error("Unable to load exited vehicle details.");
        }

        const records = await response.json();
        const exitedRecords = records.filter(function (record) {
            return record.exit_time !== null;
        });

        exitedRecords.sort(function (firstRecord, secondRecord) {
            return parseParkingDate(secondRecord.exit_time) - parseParkingDate(firstRecord.exit_time);
        });

        exitedVehiclesGrid.innerHTML = "";

        if (exitedRecords.length === 0) {
            exitedVehiclesGrid.innerHTML = "<p>No exited vehicles found.</p>";
            return;
        }

        exitedRecords.forEach(function (record, index) {

            const slotItem = document.createElement("div");
            const slotNumber = record.slot_number || "-";

            slotItem.className = "parked-slot-item";

            const details = document.createElement("div");
            details.className = "parked-slot-details";
            details.innerHTML = `
                <p class="record-index">Vehicle #${index + 1}</p>
                <p class="slot-number-label">${slotNumber}</p>
                <p><strong>Vehicle:</strong> ${record.vehicle_number || "-"}</p>
                <p><strong>Type:</strong> ${record.vehicle_type || "-"}</p>
                <p><strong>Entry Time:</strong> ${formatDateTime(record.entry_time)}</p>
                <p><strong>Exit Time:</strong> ${formatDateTime(record.exit_time)}</p>
            `;

            const ownerDetails = document.createElement("div");
            ownerDetails.className = "parked-slot-details parked-owner-details";
            ownerDetails.innerHTML = `
                <p class="selected-slot-label">Owner details</p>
                <p><strong>Name:</strong> ${record.owner_name || "-"}</p>
                <p><strong>Contact:</strong> ${record.contact_number || "-"}</p>
                <p><strong>Paid Amount:</strong> Rs. ${calculateParkingAmount(
                    record.vehicle_type,
                    calculateParkedDays(record.entry_time, record.exit_time)
                )}</p>
            `;

            slotItem.appendChild(details);
            slotItem.appendChild(ownerDetails);
            exitedVehiclesGrid.appendChild(slotItem);

        });

    } catch (error) {

        console.error("Error loading exited vehicles:", error);
        exitedVehiclesGrid.innerHTML = "<p>Unable to load exited vehicle details.</p>";

    }

}


function calculateParkedDays(entryTime, exitTime) {

    const elapsedMilliseconds =
        parseParkingDate(exitTime).getTime() -
        parseParkingDate(entryTime).getTime();

    return Math.max(1, Math.ceil(elapsedMilliseconds / (24 * 60 * 60 * 1000)));

}


function calculateParkingAmount(vehicleType, parkedDays) {

    const rateByType = {
        Bike: 20,
        Car: 30,
        Van: 30,
        Auto: 50,
        Truck: 50,
        Bus: 50
    };

    return (rateByType[vehicleType] || 0) * parkedDays;

}


// DASHBOARD - RECENT PARKING ACTIVITY


async function loadRecentParkingActivity() {

    const tableBody = document.getElementById(
        "recentActivityBody"
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



// FORMAT DATE AND TIME


function formatDateTime(dateTime) {

    if (!dateTime || dateTime === "-") {
        return "-";
    }


    try {

        const date = parseParkingDate(dateTime);


        if (isNaN(date.getTime())) {
            return dateTime;
        }


        return date.toLocaleString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });

    } catch (error) {

        return dateTime;

    }

}


function parseParkingDate(dateTime) {

    if (!dateTime) {
        return new Date(NaN);
    }

    const value = String(dateTime);
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

    return new Date(hasTimezone ? value : `${value}Z`);

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

updateDashboardStats();

loadDashboardSlotGrid();


if (document.getElementById("totalSlots")) {

    setInterval(function () {

        updateDashboardStats();

        loadDashboardSlotGrid();

    }, 5000);

}
