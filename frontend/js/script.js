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



// DASHBOARD - PARKING SLOT BOXES

let dashboardSlotFilter = "all";


function setDashboardSlotFilter(filter) {

    dashboardSlotFilter = filter;

    const dashboardSlotsPanel = document.getElementById("dashboardSlotsPanel");
    const parkedPanel = document.getElementById("parkedVehiclesPanel");

    if (dashboardSlotsPanel) {
        dashboardSlotsPanel.hidden = false;
    }

    if (parkedPanel) {
        parkedPanel.hidden = true;
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

    const dashboardSlotsPanel = document.getElementById("dashboardSlotsPanel");
    const panel = document.getElementById("parkedVehiclesPanel");
    const parkedVehiclesGrid = document.getElementById("parkedVehiclesGrid");

    if (dashboardSlotsPanel) {
        dashboardSlotsPanel.hidden = true;
    }

    panel.hidden = false;
    parkedVehiclesGrid.innerHTML = "<p>Loading currently parked slots...</p>";

    try {
        const [recordsResponse, slotsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/parking/records`),
            fetch(`${API_BASE_URL}/parking-slots/`)
        ]);

        if (!recordsResponse.ok || !slotsResponse.ok) {
            throw new Error("Unable to load currently parked slots.");
        }

        const records = await recordsResponse.json();
        const slots = await slotsResponse.json();
        const activeRecords = records.filter(function (record) {

            return record.exit_time === null;

        });

        parkedVehiclesGrid.innerHTML = "";

        const activeRecordsBySlot = new Map(
            activeRecords.map(function (record) {
                return [record.slot_id, record];
            })
        );
        const occupiedSlots = slots.filter(function (slot) {
            return !slot.is_archived && activeRecordsBySlot.has(slot.id);
        });

        if (occupiedSlots.length === 0) {
            parkedVehiclesGrid.innerHTML = "<p>No vehicles are currently parked.</p>";
            return;
        }

        occupiedSlots.forEach(function (slot) {

            const slotItem = document.createElement("div");
            const slotBox = document.createElement("button");
            const record = activeRecordsBySlot.get(slot.id);
            const slotNumber = slot.slot_number || record.slot_number || "-";

            slotItem.className = "parked-slot-item";
            slotBox.type = "button";
            slotBox.className = "slot-box occupied parked-slot-button";
            slotBox.innerHTML = `
                <span class="slot-box-number">${slotNumber}</span>
                <span class="status-badge occupied">Occupied</span>
            `;

            const details = document.createElement("div");
            details.className = "parked-slot-details";
            details.hidden = true;
            details.innerHTML = `
                <p class="selected-slot-label">${slotNumber}</p>
                <p><strong>Vehicle:</strong> ${record.vehicle_number || "-"}</p>
                <p><strong>Type:</strong> ${record.vehicle_type || "-"}</p>
                <p><strong>Entry Time:</strong> ${formatDateTime(record.entry_time)}</p>
            `;

            const ownerDetails = document.createElement("div");
            ownerDetails.className = "parked-slot-details parked-owner-details";
            ownerDetails.hidden = true;
            ownerDetails.innerHTML = `
                <p class="selected-slot-label">Owner details</p>
                <p><strong>Name:</strong> ${record.owner_name || "-"}</p>
                <p><strong>Contact:</strong> ${record.contact_number || "-"}</p>
            `;

            slotBox.addEventListener("click", function () {
                if (!details.hidden) {
                    details.hidden = true;
                    ownerDetails.hidden = true;
                    return;
                }

                document.querySelectorAll(".parked-slot-details").forEach(function (item) {
                    item.hidden = true;
                });
                details.hidden = false;
                ownerDetails.hidden = false;
            });

            slotItem.appendChild(slotBox);
            slotItem.appendChild(details);
            slotItem.appendChild(ownerDetails);
            parkedVehiclesGrid.appendChild(slotItem);

        });

    } catch (error) {

        console.error("Error loading currently parked vehicles:", error);
        parkedVehiclesGrid.innerHTML = "<p>Unable to load currently parked vehicles.</p>";

    }

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

loadDashboardSlotGrid();


if (document.getElementById("totalSlots")) {

    setInterval(function () {

        updateDashboardStats();

        loadDashboardSlotGrid();

    }, 5000);

}
