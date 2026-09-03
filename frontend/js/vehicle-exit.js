// ============================================================
// API URLS
// ============================================================

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


// ============================================================
// ELEMENTS
// ============================================================

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

const exitVehicleSearchContainer =
    document.getElementById("exitVehicleSearchContainer");

const exitVehicleSearchResults =
    document.getElementById("exitVehicleSearchResults");

const exitAmountSection =
    document.getElementById("exitAmountSection");

const parkedDaysElement =
    document.getElementById("parkedDays");

const parkingAmountElement =
    document.getElementById("parkingAmount");

const entryForm =
    document.getElementById("entryForm");

const exitForm =
    document.getElementById("exitForm");

const entryMessage =
    document.getElementById("entryMessage");

const exitMessage =
    document.getElementById("exitMessage");

const exitedVehiclesBody =
    document.getElementById("exitedVehiclesBody");


// Stores currently parked vehicles
let activeExitRecords = [];


function isActiveParkingRecord(record) {

    return (
        record.exit_time === null ||
        record.exit_time === undefined ||
        record.exit_time === ""
    );
}


// ============================================================
// VEHICLE NUMBER SEARCH FORMAT
// ============================================================

function formatVehicleNumberSearch(value) {

    return String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
}


// ============================================================
// EXIT CONFIRMATION POPUP
// ============================================================

function showExitPopup(
    title,
    message,
    confirmText,
    showCancel,
    iconType
) {

    const modal =
        document.getElementById("exitConfirmModal");

    const titleElement =
        document.getElementById("exitConfirmTitle");

    /*
     * IMPORTANT:
     * If exitConfirmMessage does not exist in HTML,
     * use the paragraph inside the popup instead.
     */
    const messageElement =
        document.getElementById("exitConfirmMessage") ||
        modal.querySelector(".slot-confirm-dialog p");

    const iconElement =
        modal.querySelector(".slot-confirm-icon");

    const confirmButton =
        document.getElementById("exitConfirmAction");


    // Safety check
    if (
        !modal ||
        !titleElement ||
        !messageElement ||
        !iconElement ||
        !confirmButton
    ) {

        console.error(
            "Exit confirmation popup elements are missing."
        );

        // Do not block vehicle exit if popup HTML has a problem
        return Promise.resolve(true);
    }


    // Create Cancel button if it does not already exist

    let cancelButton =
        document.getElementById("exitCancelAction");


    if (!cancelButton) {

        const actionsContainer =
            modal.querySelector(
                ".slot-confirm-actions"
            );

        cancelButton =
            document.createElement("button");

        cancelButton.type =
            "button";

        cancelButton.id =
            "exitCancelAction";

        cancelButton.className =
            "slot-confirm-button";

        cancelButton.textContent =
            "Cancel";

        if (actionsContainer) {
            actionsContainer.prepend(
                cancelButton
            );
        }
    }


    // Set popup content

    titleElement.textContent =
        title;

    messageElement.textContent =
        message;

    confirmButton.textContent =
        confirmText;


    cancelButton.hidden =
        !showCancel;


    // Set icon

    iconElement.textContent =
        iconType === "success"
            ? String.fromCharCode(10003)
            : String.fromCharCode(9888);


    iconElement.className =
        `slot-confirm-icon ${iconType}`;


    modal.className =
        `slot-confirm-modal ${iconType}`;


    modal.hidden =
        false;


    // Return Promise for Yes / Cancel

    return new Promise(function (resolve) {

        function close(result) {

            modal.hidden =
                true;

            confirmButton.removeEventListener(
                "click",
                confirmAction
            );

            cancelButton.removeEventListener(
                "click",
                cancelAction
            );

            cancelButton.hidden =
                true;

            resolve(result);
        }


        function confirmAction() {

            close(true);
        }


        function cancelAction() {

            close(false);
        }


        confirmButton.addEventListener(
            "click",
            confirmAction
        );

        cancelButton.addEventListener(
            "click",
            cancelAction
        );

    });
}


// ============================================================
// LOAD VEHICLES
// ============================================================

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


        // Clear entry vehicle dropdown

        if (entryVehicle) {

            entryVehicle.innerHTML = `
                <option value="">
                    Select Vehicle
                </option>
            `;
        }


        // Add vehicles

        vehicles.forEach(function (vehicle) {

            const option =
                document.createElement("option");


            option.value =
                vehicle.id;


            option.textContent =
                `${vehicle.vehicle_number} - ${vehicle.vehicle_type}`;


            if (entryVehicle) {

                entryVehicle.appendChild(
                    option
                );
            }

        });


    } catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );


        if (entryMessage) {

            entryMessage.textContent =
                error.message;
        }
    }
}


// ============================================================
// LOAD AVAILABLE PARKING SLOTS
// ============================================================

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
                String(slot.status).toLowerCase() ===
                "available" &&
                !slot.is_archived
            ) {

                const option =
                    document.createElement("option");


                option.value =
                    slot.id;


                option.textContent =
                    `${slot.slot_number} - Available`;


                entrySlot.appendChild(
                    option
                );
            }

        });


    } catch (error) {

        console.error(
            "Slot loading error:",
            error
        );


        if (entryMessage) {

            entryMessage.textContent =
                error.message;
        }
    }
}


// ============================================================
// LOAD PARKING RECORDS
// ============================================================

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


        console.log(
            "Parking records loaded:",
            records
        );


        // ====================================================
        // ACTIVE PARKING RECORDS
        // ====================================================

        const activeRecords =
            records.filter(isActiveParkingRecord);


        // ====================================================
        // EXITED PARKING RECORDS
        // ====================================================

        const exitedRecords =
            records.filter(function (record) {

                return record.exit_time !== null;
            });


        // Store active records

        activeExitRecords =
            activeRecords;


        console.log(
            "Active parking records:",
            activeExitRecords
        );


        // IMPORTANT:
        // Always populate Vehicle Type dropdown
        // from currently parked vehicles.

        updateExitVehicleDropdown(
            activeExitRecords
        );


        // ====================================================
        // CLEAR EXITED VEHICLE TABLE
        // ====================================================

        if (exitedVehiclesBody) {

            exitedVehiclesBody.innerHTML =
                "";
        }


        // ====================================================
        // SORT EXITED VEHICLES
        // Latest exit first
        // ====================================================

        exitedRecords.sort(
            function (
                firstRecord,
                secondRecord
            ) {

                return (
                    parseParkingDate(
                        secondRecord.exit_time
                    ) -
                    parseParkingDate(
                        firstRecord.exit_time
                    )
                );

            }
        );


        // ====================================================
        // NO EXITED VEHICLES
        // ====================================================

        if (
            exitedRecords.length === 0
        ) {

            if (exitedVehiclesBody) {

                exitedVehiclesBody.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            style="text-align:center;"
                        >

                            No exited vehicles found.

                        </td>

                    </tr>

                `;
            }

            return;
        }


        // ====================================================
        // DISPLAY EXITED VEHICLES
        // ====================================================

        exitedRecords.forEach(
            function (
                record,
                index
            ) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${
                            record.vehicle_number ||
                            record.vehicle_id
                        }
                    </td>

                    <td>
                        ${
                            record.slot_number ||
                            record.slot_id
                        }
                    </td>

                    <td>
                        ${formatDateTime(
                            record.entry_time
                        )}
                    </td>

                    <td>
                        ${formatDateTime(
                            record.exit_time
                        )}
                    </td>

                    <td>

                        <span class="status-badge exited">

                            Exited

                        </span>

                    </td>

                `;


                if (exitedVehiclesBody) {

                    exitedVehiclesBody.appendChild(
                        row
                    );
                }

            }
        );


    } catch (error) {

        console.error(
            "Parking record loading error:",
            error
        );


        if (exitedVehiclesBody) {

            exitedVehiclesBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;"
                    >

                        Unable to load parking records.

                    </td>

                </tr>

            `;
        }


        // Clear dropdown if API fails

        activeExitRecords = [];

        updateExitVehicleDropdown([]);
    }
}


// ============================================================
// UPDATE EXIT VEHICLE TYPE DROPDOWN
// ============================================================

function updateExitVehicleDropdown(
    activeRecords
) {

    if (
        !exitVehicleType ||
        !exitVehicle
    ) {
        return;
    }


    // Get unique vehicle types

    const vehicleTypes =
        [
            ...new Set(
                activeRecords
                    .map(function (record) {

                        return record.vehicle_type;

                    })
                    .filter(Boolean)
            )
        ];


    // Vehicle type dropdown

    exitVehicleType.innerHTML = `

        <option value="">
            Select Vehicle Type
        </option>

    `;


    vehicleTypes.forEach(
        function (vehicleType) {

            const option =
                document.createElement("option");


            option.value =
                vehicleType;


            option.textContent =
                vehicleType;


            exitVehicleType.appendChild(
                option
            );

        }
    );


    // Reset vehicle number

    exitVehicle.innerHTML = `

        <option value="">
            Select Vehicle Number
        </option>

    `;


    exitVehicle.disabled =
        true;


    // Hide amount

    if (exitAmountSection) {

        exitAmountSection.hidden =
            true;
    }


    // Reset search

    if (exitVehicleSearch) {

        exitVehicleSearch.value =
            "";
    }

    if (exitVehicleSearchContainer) {

        exitVehicleSearchContainer.hidden =
            true;
    }
}


// ============================================================
// POPULATE EXIT VEHICLE NUMBERS
// ============================================================

function populateExitVehicleNumbers() {

    if (
        !exitVehicleType ||
        !exitVehicle
    ) {
        return;
    }


    const selectedType =
        exitVehicleType.value;


    const searchText =
        exitVehicleSearch
            ? formatVehicleNumberSearch(
                exitVehicleSearch.value
            )
            : "";


    exitVehicle.innerHTML = `

        <option value="">
            Select Vehicle Number
        </option>

    `;


    const matchingRecords =
        getMatchingExitRecords();


    matchingRecords.forEach(function (record) {

        const option =
            document.createElement("option");


        option.value =
            record.vehicle_id;


        option.textContent =
            record.vehicle_number ||
            `Vehicle ID: ${record.vehicle_id}`;


        option.dataset.entryTime =
            record.entry_time;


        option.dataset.vehicleType =
            record.vehicle_type || "";


        exitVehicle.appendChild(
            option
        );

    });


    if (selectedType && searchText && matchingRecords.length === 0) {

        const noMatchesOption =
            document.createElement("option");

        noMatchesOption.textContent =
            "No parked vehicles match this search";

        noMatchesOption.disabled =
            true;

        exitVehicle.appendChild(
            noMatchesOption
        );
    }


    exitVehicle.disabled =
        !selectedType;


    if (exitAmountSection) {

        exitAmountSection.hidden =
            true;
    }
}


function getMatchingExitRecords() {

    const selectedType =
        exitVehicleType
            ? exitVehicleType.value
            : "";


    const searchText =
        exitVehicleSearch
            ? formatVehicleNumberSearch(
                exitVehicleSearch.value
            )
            : "";


    return activeExitRecords.filter(function (record) {

            const vehicleNumber =
                formatVehicleNumberSearch(
                    record.vehicle_number
                );


            return (
                vehicleNumber.startsWith(searchText) &&
                (
                    searchText ||
                    record.vehicle_type === selectedType
                )
            );

        });
}


function renderExitVehicleSearchResults() {

    if (!exitVehicleSearchResults) {
        return;
    }


    const searchText =
        exitVehicleSearch
            ? formatVehicleNumberSearch(
                exitVehicleSearch.value
            )
            : "";


    const matchingRecords =
        getMatchingExitRecords();


    exitVehicleSearchResults.innerHTML = "";

    exitVehicleSearchResults.hidden = false;


    if (!searchText) {

        exitVehicleSearchResults.textContent =
            "Enter a vehicle number to search.";

        return;
    }


    if (matchingRecords.length === 0) {

        exitVehicleSearchResults.textContent =
            "No parked vehicles match this search.";

        return;
    }


    matchingRecords.forEach(function (record) {

        const resultButton =
            document.createElement("button");

        resultButton.type = "button";

        resultButton.className =
            "vehicle-search-result";

        resultButton.textContent =
            `${record.vehicle_number} - ${record.vehicle_type}`;

        resultButton.addEventListener("click", function () {

            if (exitVehicleType) {

                exitVehicleType.value =
                    record.vehicle_type;
            }


            exitVehicle.innerHTML = `
                <option value="">Select Vehicle Number</option>
            `;


            const selectedOption =
                document.createElement("option");

            selectedOption.value =
                record.vehicle_id;

            selectedOption.textContent =
                record.vehicle_number;

            selectedOption.dataset.entryTime =
                record.entry_time;

            selectedOption.dataset.vehicleType =
                record.vehicle_type || "";

            exitVehicle.appendChild(
                selectedOption
            );

            exitVehicle.disabled = false;

            exitVehicle.value = String(record.vehicle_id);

            exitVehicle.dispatchEvent(
                new Event("change")
            );

            exitVehicleSearchResults.hidden =
                true;
        });

        exitVehicleSearchResults.appendChild(
            resultButton
        );
    });
}



async function searchExitVehicles() {

    try {

        const response =
            await fetch(RECORDS_API);


        if (!response.ok) {

            throw new Error(
                "Unable to refresh parked vehicles."
            );
        }


        const records =
            await response.json();


        activeExitRecords =
            records.filter(isActiveParkingRecord);

    } catch (error) {

        console.error(
            "Vehicle search refresh error:",
            error
        );
    }


    if (exitVehicle) {

        exitVehicle.innerHTML = `
            <option value="">Select Vehicle Number</option>
        `;

        exitVehicle.disabled = false;
    }


    renderExitVehicleSearchResults();
}


// ============================================================
// VEHICLE TYPE CHANGE
// ============================================================

if (exitVehicleType) {

    exitVehicleType.addEventListener(
        "change",
        function () {

            if (exitVehicleSearch) {

                exitVehicleSearch.value =
                    "";

                if (exitVehicleSearchContainer) {

                    exitVehicleSearchContainer.hidden =
                        !exitVehicleType.value;
                }
            }


            if (exitVehicleSearchResults) {

                exitVehicleSearchResults.hidden =
                    true;
            }

            populateExitVehicleNumbers();

        }
    );
}


// ============================================================
// SHOW VEHICLE SEARCH
// ============================================================

function showVehicleNumberSearch() {

    if (
        exitVehicle &&
        !exitVehicle.disabled &&
        exitVehicleSearch
    ) {

        exitVehicleSearchContainer.hidden =
            false;
    }
}


if (exitVehicle) {

    exitVehicle.addEventListener(
        "focus",
        showVehicleNumberSearch
    );


    exitVehicle.addEventListener(
        "click",
        showVehicleNumberSearch
    );
}


// ============================================================
// VEHICLE NUMBER SEARCH
// ============================================================

if (exitVehicleSearch) {

    exitVehicleSearch.addEventListener(
        "input",
        function () {

            const formattedValue =
                formatVehicleNumberSearch(
                    exitVehicleSearch.value
                );


            exitVehicleSearch.value =
                formattedValue;


            if (exitVehicleSearchResults) {

                exitVehicleSearchResults.hidden =
                    true;
            }

        }
    );


    exitVehicleSearch.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchExitVehicles();
            }
        }
    );
}


// ============================================================
// VEHICLE NUMBER CHANGE
// ============================================================

if (exitVehicle) {

    exitVehicle.addEventListener(
        "change",
        function () {

            const selectedOption =
                exitVehicle.options[
                    exitVehicle.selectedIndex
                ];


            const entryTime =
                selectedOption
                    ? selectedOption.dataset.entryTime
                    : "";


            const vehicleType =
                (selectedOption
                    ? selectedOption.dataset.vehicleType
                    : "") ||
                (
                    exitVehicleType
                        ? exitVehicleType.value
                        : ""
                );


            if (exitVehicleType && vehicleType) {

                exitVehicleType.value =
                    vehicleType;
            }


            // Parking rates

            const rateByType = {

                Bike: 20,

                Car: 30,

                Van: 30,

                Auto: 50,

                Truck: 50,

                Bus: 50

            };


            if (
                !entryTime ||
                !rateByType[vehicleType]
            ) {

                if (exitAmountSection) {

                    exitAmountSection.hidden =
                        true;
                }

                return;
            }


            const elapsedMilliseconds =
                Date.now() -
                parseParkingDate(
                    entryTime
                ).getTime();


            const parkedDays =
                Math.max(
                    1,
                    Math.ceil(
                        elapsedMilliseconds /
                        (
                            24 *
                            60 *
                            60 *
                            1000
                        )
                    )
                );


            if (parkedDaysElement) {

                parkedDaysElement.textContent =
                    parkedDays;
            }


            if (parkingAmountElement) {

                parkingAmountElement.textContent =
                    parkedDays *
                    rateByType[vehicleType];
            }


            if (exitAmountSection) {

                exitAmountSection.hidden =
                    false;
            }

        }
    );
}


// ============================================================
// VEHICLE ENTRY
// ============================================================

if (entryForm) {

    entryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const vehicleId =
                Number(
                    entryVehicle.value
                );


            const slotId =
                Number(
                    entrySlot.value
                );


            if (
                !vehicleId ||
                !slotId
            ) {

                if (entryMessage) {

                    entryMessage.textContent =
                        "Please select a vehicle and parking slot.";
                }

                return;
            }


            if (entryMessage) {

                entryMessage.textContent =
                    "Recording vehicle entry...";
            }


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


                if (entryMessage) {

                    entryMessage.textContent =
                        "Vehicle entry recorded successfully!";
                }


                entryForm.reset();


                // Refresh data

                await loadAvailableSlots();

                await loadParkingRecords();


            } catch (error) {

                console.error(
                    "Entry error:",
                    error
                );


                if (entryMessage) {

                    entryMessage.textContent =
                        error.message;
                }
            }

        }
    );
}


// ============================================================
// VEHICLE EXIT
// ============================================================

if (exitForm) {

    exitForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const vehicleId =
                Number(
                    exitVehicle.value
                );


            // Make sure vehicle is selected

            if (!vehicleId) {

                if (exitMessage) {

                    exitMessage.textContent =
                        "Please select a parked vehicle.";
                }

                return;
            }


            // Clear old message

            if (exitMessage) {

                exitMessage.textContent =
                    "";
            }


            // =================================================
            // CONFIRM EXIT
            // =================================================

            const confirmed =
                await showExitPopup(
                    "Confirm Vehicle Exit",
                    "Do you want to record this vehicle exit?",
                    "Yes",
                    true,
                    "warning"
                );


            if (!confirmed) {

                return;
            }


            // =================================================
            // SEND EXIT REQUEST
            // =================================================

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


                console.log(
                    "Exit API response:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result.detail ||
                        "Failed to record vehicle exit."
                    );
                }


                // =================================================
                // SUCCESS POPUP
                // =================================================

                await showExitPopup(
                    "Vehicle Exit Recorded",
                    "Vehicle exit recorded successfully!",
                    "OK",
                    false,
                    "success"
                );


                // Reset form

                exitForm.reset();


                // =================================================
                // REFRESH DATA
                // =================================================

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
}


// ============================================================
// FORMAT DATE / TIME
// ============================================================

function formatDateTime(
    dateTime
) {

    if (!dateTime) {

        return "-";
    }


    const date =
        parseParkingDate(
            dateTime
        );


    return date.toLocaleString(
        [],
        {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );
}


// ============================================================
// PARSE PARKING DATE
// ============================================================

function parseParkingDate(
    dateTime
) {

    if (!dateTime) {

        return new Date(NaN);
    }


    const value =
        String(dateTime);


    const hasTimezone =
        /(?:Z|[+-]\d{2}:?\d{2})$/i.test(
            value
        );


    return new Date(
        hasTimezone
            ? value
            : `${value}Z`
    );
}


// ============================================================
// INITIAL LOAD
// ============================================================

async function initializePage() {

    await loadVehicles();

    await loadAvailableSlots();

    await loadParkingRecords();

}


initializePage();
