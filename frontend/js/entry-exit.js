// API URLS


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



// ELEMENTS


const entryVehicle =
    document.getElementById("entryVehicle");

const entrySlot =
    document.getElementById("entrySlot");

const exitVehicle =
    document.getElementById("exitVehicle");

const exitVehicleType =
    document.getElementById("exitVehicleType");

const exitVehicleSearch =
    document.getElementById("exitVehicleSearch");

const exitAmountSection =
    document.getElementById("exitAmountSection");

const parkedDaysElement =
    document.getElementById("parkedDays");

const parkingAmountElement =
    document.getElementById("parkingAmount");

let activeExitRecords = [];

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


function showExitSuccessPopup() {

    const modal = document.getElementById("exitConfirmModal");
    const confirmButton = document.getElementById("exitConfirmAction");

    modal.hidden = false;

    return new Promise(function (resolve) {

        function close() {
            modal.hidden = true;
            confirmButton.removeEventListener("click", close);
            resolve();
        }

        confirmButton.addEventListener("click", close);

    });

}



// LOAD VEHICLES


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

        if (entryVehicle) {
            entryVehicle.innerHTML = `
                <option value="">Select Vehicle</option>
            `;
        }



        // Add vehicles to entry dropdown

        vehicles.forEach(function (vehicle) {

            const option =
                document.createElement("option");

            option.value = vehicle.id;

            option.textContent =
                `${vehicle.vehicle_number} - ${vehicle.vehicle_type}`;

            if (entryVehicle) {
                entryVehicle.appendChild(option);
            }

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



// LOAD AVAILABLE PARKING SLOTS


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


        if (!entrySlot) {
            return;
        }

        entrySlot.innerHTML = `
            <option value="">
                Select Available Slot
            </option>
        `;


        slots.forEach(function (slot) {

            if (
                String(slot.status).toLowerCase()
                === "available" &&
                !slot.is_archived
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



// LOAD PARKING RECORDS


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

        activeRecords.forEach(function (record, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${record.vehicle_number || record.vehicle_id}
                </td>

                <td>
                    ${record.slot_number || record.slot_id}
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


        activeExitRecords = activeRecords;
        updateExitVehicleDropdown(activeRecords);


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



// UPDATE EXIT VEHICLE DROPDOWN


function updateExitVehicleDropdown(
    activeRecords
) {

    const vehicleTypes = [...new Set(
        activeRecords
            .map(record => record.vehicle_type)
            .filter(Boolean)
    )];

    exitVehicleType.innerHTML = `
        <option value="">Select Vehicle Type</option>
    `;
    vehicleTypes.forEach(function (vehicleType) {
        const option = document.createElement("option");
        option.value = vehicleType;
        option.textContent = vehicleType;
        exitVehicleType.appendChild(option);
    });

    exitVehicle.innerHTML = `

        <option value="">

            Select Vehicle Number

        </option>

    `;


    exitVehicle.disabled = true;
    exitAmountSection.hidden = true;

    exitVehicleSearch.value = "";

}


function populateExitVehicleNumbers() {

    const selectedType = exitVehicleType.value;
    const searchText = exitVehicleSearch.value.trim().toUpperCase();

    exitVehicle.innerHTML = "<option value=\"\">Select Vehicle Number</option>";

    activeExitRecords
        .filter(function (record) {
            const vehicleNumber = String(record.vehicle_number || "").toUpperCase();
            return record.vehicle_type === selectedType && vehicleNumber.includes(searchText);
        })
        .forEach(function (record) {
            const option = document.createElement("option");
            option.value = record.vehicle_id;
            option.textContent = record.vehicle_number || `Vehicle ID: ${record.vehicle_id}`;
            option.dataset.entryTime = record.entry_time;
            exitVehicle.appendChild(option);
        });

    exitVehicle.disabled = !selectedType;
    exitAmountSection.hidden = true;

}


exitVehicleType.addEventListener("change", function () {

    exitVehicleSearch.value = "";
    populateExitVehicleNumbers();

});


exitVehicleSearch.addEventListener("input", populateExitVehicleNumbers);


exitVehicle.addEventListener("change", function () {

    const selectedOption = exitVehicle.options[exitVehicle.selectedIndex];
    const entryTime = selectedOption ? selectedOption.dataset.entryTime : "";
    const vehicleType = exitVehicleType.value;
    const rateByType = {
        Bike: 20,
        Car: 30,
        Van: 30,
        Auto: 50,
        Truck: 50,
        Bus: 50
    };

    if (!entryTime || !rateByType[vehicleType]) {
        exitAmountSection.hidden = true;
        return;
    }

    const elapsedMilliseconds = Date.now() - new Date(entryTime).getTime();
    const parkedDays = Math.max(
        1,
        Math.ceil(elapsedMilliseconds / (24 * 60 * 60 * 1000))
    );

    parkedDaysElement.textContent = parkedDays;
    parkingAmountElement.textContent = parkedDays * rateByType[vehicleType];
    exitAmountSection.hidden = false;

});


// VEHICLE ENTRY


if (entryForm) {

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

}



// VEHICLE EXIT


exitForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const vehicleId =
            Number(exitVehicle.value);


        if (!vehicleId) {

            if (exitMessage) {
                exitMessage.textContent =
                    "Please select a parked vehicle.";
            }

            return;

        }


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


            await showExitSuccessPopup();


            exitForm.reset();


            // Refresh data

            await loadAvailableSlots();

            await loadParkingRecords();


        } catch (error) {

            console.error(
                "Exit error:",
                error
            );

            if (exitMessage) {
                exitMessage.textContent =
                    error.message;
            }

        }

    }
);



// FORMAT DATE / TIME


function formatDateTime(
    dateTime
) {

    if (!dateTime) {

        return "-";

    }


    const date =
        new Date(dateTime);


    return date.toLocaleString([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

}



// INITIAL LOAD


async function initializePage() {

    await loadVehicles();

    await loadAvailableSlots();

    await loadParkingRecords();

}


initializePage();
