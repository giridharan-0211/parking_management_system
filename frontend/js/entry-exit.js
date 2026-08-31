// =====================================================
// API URLS
// =====================================================

const VEHICLES_API =
    "http://127.0.0.1:8000/vehicles/";

const SLOTS_API =
    "http://127.0.0.1:8000/parking-slots/";

const ENTRY_API =
    "http://127.0.0.1:8000/parking/entry";

const EXIT_API =
    "http://127.0.0.1:8000/parking/exit";

const RECORDS_API =
    "http://127.0.0.1:8000/parking/records";


// =====================================================
// ELEMENTS
// =====================================================

const entryVehicle =
    document.getElementById("entryVehicle");

const entrySlot =
    document.getElementById("entrySlot");

const exitVehicle =
    document.getElementById("exitVehicle");

const entryForm =
    document.getElementById("entryForm");

const exitForm =
    document.getElementById("exitForm");

const entryMessage =
    document.getElementById("entryMessage");

const exitMessage =
    document.getElementById("exitMessage");

const currentParkingBody =
    document.getElementById("currentParkingBody");


// =====================================================
// LOAD VEHICLES
// =====================================================

async function loadVehicles() {

    try {

        const response =
            await fetch(VEHICLES_API);

        if (!response.ok) {

            throw new Error(
                "Unable to load vehicles."
            );

        }

        const vehicles =
            await response.json();


        // Clear old options

        entryVehicle.innerHTML = `
            <option value="">
                Select Vehicle
            </option>
        `;


        exitVehicle.innerHTML = `
            <option value="">
                Select Parked Vehicle
            </option>
        `;


        // Add vehicles to entry dropdown

        vehicles.forEach(function (vehicle) {

            const option =
                document.createElement("option");

            option.value = vehicle.id;

            option.textContent =
                `${vehicle.vehicle_number} - ${vehicle.vehicle_type}`;

            entryVehicle.appendChild(option);

        });


        // Exit vehicle list will be populated
        // separately using parking records


    } catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );

        entryMessage.textContent =
            error.message;

    }

}


// =====================================================
// LOAD AVAILABLE PARKING SLOTS
// =====================================================

async function loadAvailableSlots() {

    try {

        const response =
            await fetch(SLOTS_API);

        if (!response.ok) {

            throw new Error(
                "Unable to load parking slots."
            );

        }

        const slots =
            await response.json();


        entrySlot.innerHTML = `
            <option value="">
                Select Available Slot
            </option>
        `;


        slots.forEach(function (slot) {

            if (
                String(slot.status).toLowerCase()
                === "available"
            ) {

                const option =
                    document.createElement("option");

                option.value = slot.id;

                option.textContent =
                    `${slot.slot_number} - Available`;

                entrySlot.appendChild(option);

            }

        });


    } catch (error) {

        console.error(
            "Slot loading error:",
            error
        );

        entryMessage.textContent =
            error.message;

    }

}


// =====================================================
// LOAD PARKING RECORDS
// =====================================================

async function loadParkingRecords() {

    try {

        const response =
            await fetch(RECORDS_API);

        if (!response.ok) {

            throw new Error(
                "Unable to load parking records."
            );

        }

        const records =
            await response.json();


        currentParkingBody.innerHTML = "";


        // Find currently parked vehicles

        const activeRecords =
            records.filter(function (record) {

                return record.exit_time === null;

            });


        // No vehicles currently parked

        if (activeRecords.length === 0) {

            currentParkingBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="text-align:center;"
                    >

                        No vehicles are currently parked.

                    </td>

                </tr>

            `;

            updateExitVehicleDropdown([]);

            return;

        }


        // Display active records

        activeRecords.forEach(function (record) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${record.id}
                </td>

                <td>
                    ${record.vehicle_id}
                </td>

                <td>
                    ${record.slot_id}
                </td>

                <td>
                    ${formatDateTime(record.entry_time)}
                </td>

                <td>

                    <span class="status-badge occupied">

                        Parked

                    </span>

                </td>

            `;


            currentParkingBody.appendChild(row);

        });


        updateExitVehicleDropdown(
            activeRecords
        );


    } catch (error) {

        console.error(
            "Parking record loading error:",
            error
        );

        currentParkingBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;"
                >

                    Unable to load parking records.

                </td>

            </tr>

        `;

    }

}


// =====================================================
// UPDATE EXIT VEHICLE DROPDOWN
// =====================================================

function updateExitVehicleDropdown(
    activeRecords
) {

    exitVehicle.innerHTML = `

        <option value="">

            Select Parked Vehicle

        </option>

    `;


    activeRecords.forEach(function (record) {

        const option =
            document.createElement("option");

        option.value =
            record.vehicle_id;

        option.textContent =
            `Vehicle ID: ${record.vehicle_id}`;

        exitVehicle.appendChild(option);

    });

}


// =====================================================
// VEHICLE ENTRY
// =====================================================

entryForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const vehicleId =
            Number(entryVehicle.value);

        const slotId =
            Number(entrySlot.value);


        if (!vehicleId || !slotId) {

            entryMessage.textContent =
                "Please select a vehicle and parking slot.";

            return;

        }


        entryMessage.textContent =
            "Recording vehicle entry...";


        try {

            const response =
                await fetch(
                    ENTRY_API,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            vehicle_id:
                                vehicleId,

                            slot_id:
                                slotId

                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Failed to record vehicle entry."
                );

            }


            entryMessage.textContent =
                "Vehicle entry recorded successfully!";


            entryForm.reset();


            // Refresh data

            await loadAvailableSlots();

            await loadParkingRecords();


        } catch (error) {

            console.error(
                "Entry error:",
                error
            );

            entryMessage.textContent =
                error.message;

        }

    }
);


// =====================================================
// VEHICLE EXIT
// =====================================================

exitForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const vehicleId =
            Number(exitVehicle.value);


        if (!vehicleId) {

            exitMessage.textContent =
                "Please select a parked vehicle.";

            return;

        }


        exitMessage.textContent =
            "Recording vehicle exit...";


        try {

            const response =
                await fetch(
                    EXIT_API,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            vehicle_id:
                                vehicleId

                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Failed to record vehicle exit."
                );

            }


            exitMessage.textContent =
                "Vehicle exit recorded successfully!";


            exitForm.reset();


            // Refresh data

            await loadAvailableSlots();

            await loadParkingRecords();


        } catch (error) {

            console.error(
                "Exit error:",
                error
            );

            exitMessage.textContent =
                error.message;

        }

    }
);


// =====================================================
// FORMAT DATE / TIME
// =====================================================

function formatDateTime(
    dateTime
) {

    if (!dateTime) {

        return "-";

    }


    const date =
        new Date(dateTime);


    return date.toLocaleString();

}


// =====================================================
// INITIAL LOAD
// =====================================================

async function initializePage() {

    await loadVehicles();

    await loadAvailableSlots();

    await loadParkingRecords();

}


initializePage();