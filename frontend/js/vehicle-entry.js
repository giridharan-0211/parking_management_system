// VEHICLES PAGE


const VEHICLE_API_URL = "http://127.0.0.1:8000/vehicles/";
const SLOT_API_URL = "http://127.0.0.1:8000/parking-slots/";


function showVehicleConfirmation(
    message,
    title,
    confirmText,
    showCancel,
    iconType
) {

    const modal = document.getElementById("vehicleConfirmModal");
    const titleElement = document.getElementById("vehicleConfirmTitle");
    const iconElement = document.getElementById("vehicleConfirmIcon");
    const messageElement = document.getElementById("vehicleConfirmMessage");
    const confirmButton = document.getElementById("vehicleConfirmAction");
    const cancelButtons = modal.querySelectorAll("[data-vehicle-confirm-cancel]");

    titleElement.textContent = title;
    iconElement.textContent = iconType === "success"
        ? String.fromCharCode(10003)
        : String.fromCharCode(9888);
    iconElement.className = `slot-confirm-icon ${iconType}`;
    messageElement.textContent = message;
    confirmButton.textContent = confirmText;
    modal.className = `slot-confirm-modal ${iconType}`;
    cancelButtons.forEach(function (button) {
        button.hidden = !showCancel;
    });
    modal.hidden = false;

    return new Promise(function (resolve) {

        function close(result) {
            modal.hidden = true;
            confirmButton.removeEventListener("click", confirmAction);
            cancelButtons.forEach(function (button) {
                button.removeEventListener("click", cancelAction);
                button.hidden = false;
            });
            resolve(result);
        }

        function confirmAction() {
            close(true);
        }

        function cancelAction() {
            close(false);
        }

        confirmButton.addEventListener("click", confirmAction);
        cancelButtons.forEach(function (button) {
            button.addEventListener("click", cancelAction);
        });

    });

}


const vehicleNumberInput =
    document.getElementById("vehicleNumber");
const ownerNameInput =
    document.getElementById("ownerName");
const contactNumberInput =
    document.getElementById("contactNumber");


if (vehicleNumberInput) {

    vehicleNumberInput.addEventListener("input", function () {

        vehicleNumberInput.setCustomValidity("");

        const format = [
            /[A-Z]/, /[A-Z]/,
            /\d/, /\d/,
            /[A-Z]/, /[A-Z]/,
            /\d/, /\d/, /\d/, /\d/
        ];

        const typedValue = vehicleNumberInput.value.toUpperCase();
        let formattedValue = "";

        for (const character of typedValue) {
            const expectedCharacter = format[formattedValue.length];

            if (expectedCharacter && expectedCharacter.test(character)) {
                formattedValue += character;
            }

            if (formattedValue.length === format.length) {
                break;
            }
        }

        vehicleNumberInput.value = formattedValue;

    });

}


ownerNameInput.addEventListener("invalid", function () {
    ownerNameInput.setCustomValidity("Please fill out the name section.");
});

ownerNameInput.addEventListener("input", function () {
    ownerNameInput.setCustomValidity("");
});

contactNumberInput.addEventListener("invalid", function () {
    contactNumberInput.setCustomValidity(
        "Please fill out the contact number."
    );
});

contactNumberInput.addEventListener("input", function () {
    contactNumberInput.setCustomValidity("");
});


vehicleNumberInput.addEventListener("invalid", function () {
    vehicleNumberInput.setCustomValidity(
        "Please enter the vehicle number."
    );
});


async function loadAssignableSlots() {

    const assignedSlot =
        document.getElementById("assignedSlot");

    if (!assignedSlot) {
        return;
    }

    try {
        const [slotResponse, vehicleResponse] = await Promise.all([
            fetch(SLOT_API_URL),
            fetch(VEHICLE_API_URL)
        ]);

        if (!slotResponse.ok || !vehicleResponse.ok) {
            throw new Error("Unable to load parking slots.");
        }

        const slots = await slotResponse.json();
        const vehicles = await vehicleResponse.json();

        const assignedSlotIds = new Set(
            vehicles
                .map(vehicle => vehicle.assigned_slot_id)
                .filter(slotId => slotId !== null)
        );

        assignedSlot.innerHTML = `
            <option value="">Select Parking Slot</option>
        `;

        slots.forEach(function (slot) {

            if (
                String(slot.status).toLowerCase() === "available" &&
                !slot.is_archived &&
                !assignedSlotIds.has(slot.id)
            ) {
                const option = document.createElement("option");

                option.value = slot.id;
                option.textContent = slot.slot_number;

                assignedSlot.appendChild(option);
            }

        });

    } catch (error) {

        console.error("Error loading assignable slots:", error);

    }

}


// LOAD VEHICLES


async function loadVehicles() {

    const tableBody =
        document.getElementById("vehicleTableBody");

    if (!tableBody) {
        return;
    }


    try {

        const response = await fetch(VEHICLE_API_URL);


        if (!response.ok) {

            throw new Error(
                `Failed to load vehicles: ${response.status}`
            );

        }


        const vehicles = await response.json();

        console.log("Vehicles received:", vehicles);


        tableBody.innerHTML = "";


        if (vehicles.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        No added vehicles.
                    </td>
                </tr>
            `;

            return;
        }


        vehicles.forEach(function (vehicle) {

            const row = document.createElement("tr");


            row.innerHTML = `
                <td>${vehicle.id}</td>

                <td>${vehicle.vehicle_number || "-"}</td>

                <td>${vehicle.vehicle_type || "-"}</td>

                <td>${vehicle.owner_name || "-"}</td>

                <td>${vehicle.contact_number || "-"}</td>

                <td>${vehicle.assigned_slot_number || "-"}</td>

                <td>

                    <button
                        class="delete-button"
                        onclick="deleteVehicle(${vehicle.id})"
                    >
                        Delete
                    </button>

                </td>
            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Error loading vehicles:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Unable to load vehicles.
                </td>
            </tr>
        `;

    }

}


// ADD VEHICLE


const vehicleForm =
    document.getElementById("vehicleForm");


if (vehicleForm) {

    const vehicleTypeSelect =
        document.getElementById("vehicleType");
    const assignedSlotSelect =
        document.getElementById("assignedSlot");

    vehicleTypeSelect.addEventListener("invalid", function () {
        vehicleTypeSelect.setCustomValidity(
            "Please select the vehicle type."
        );
    });

    vehicleTypeSelect.addEventListener("change", function () {
        vehicleTypeSelect.setCustomValidity("");
    });

    assignedSlotSelect.addEventListener("invalid", function () {
        assignedSlotSelect.setCustomValidity(
            "Please select a parking slot for the vehicle."
        );
    });

    assignedSlotSelect.addEventListener("change", function () {
        assignedSlotSelect.setCustomValidity("");
    });

    vehicleForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const vehicleNumber =
                document.getElementById("vehicleNumber")
                    .value
                    .trim()
                    .toUpperCase();


            const vehicleType =
                document.getElementById("vehicleType")
                    .value;


            const ownerName =
                document.getElementById("ownerName")
                    .value
                    .trim();


            const contactNumber =
                document.getElementById("contactNumber")
                    .value
                    .trim();


            const assignedSlotId =
                document.getElementById("assignedSlot")
                    .value;


            const message =
                document.getElementById("vehicleMessage");
            const vehicleNumberMessage =
                document.getElementById("vehicleNumberMessage");

            message.textContent = "";
            message.classList.remove("success");
            vehicleNumberMessage.textContent = "";


            // Check fields
            if (
                vehicleNumber === "" ||
                vehicleType === "" ||
                ownerName === "" ||
                contactNumber === ""
            ) {

                message.textContent =
                    "Please fill in all fields.";

                return;
            }

            if (!/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(vehicleNumber)) {

                await showVehicleConfirmation(
                    "Invalid format. Use AA00AA0000.",
                    "Invalid Vehicle Number",
                    "OK",
                    false,
                    "warning"
                );

                vehicleNumberInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                vehicleNumberInput.focus();

                return;
            }

            if (!/^\d{10}$/.test(contactNumber)) {

                await showVehicleConfirmation(
                    "Contact number must contain 10 digits.",
                    "Invalid Contact Number",
                    "OK",
                    false,
                    "warning"
                );

                contactNumberInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                contactNumberInput.focus();

                return;
            }


            try {

                // Send data to FastAPI
                const response = await fetch(
                    VEHICLE_API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            vehicle_number: vehicleNumber,

                            vehicle_type: vehicleType,

                            owner_name: ownerName,

                            contact_number: contactNumber,

                            assigned_slot_id: assignedSlotId
                                ? Number(assignedSlotId)
                                : null

                        })

                    }
                );


                const result =
                    await response.json();


                console.log(
                    "API response:",
                    result
                );


                // Check response
                if (!response.ok) {

                    let errorMessage =
                        "Failed to add vehicle.";

                    if (result.detail) {

                        if (Array.isArray(result.detail)) {

                            errorMessage =
                                result.detail
                                    .map(error => error.msg)
                                    .join(", ");

                        } else {

                            errorMessage =
                                result.detail;

                        }

                    }


                    throw new Error(errorMessage);

                }


                // Success
                message.classList.add("success");
                await showVehicleConfirmation(
                    "Vehicle added successfully!",
                    "Vehicle Added",
                    "OK",
                    false,
                    "success"
                );


                // Clear form
                vehicleForm.reset();


                // Refresh table
                loadVehicles();

                loadAssignableSlots();


            } catch (error) {

                console.error(
                    "Error adding vehicle:",
                    error
                );


                message.textContent =
                    error.message;

            }

        }
    );

}


// DELETE VEHICLE


async function deleteVehicle(vehicleId) {

    const confirmed = await showVehicleConfirmation(
        "Are you sure you want to delete this vehicle?",
        "Delete Vehicle",
        "Delete",
        true,
        "warning"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${VEHICLE_API_URL}${vehicleId}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Failed to delete vehicle."
            );

        }


        await showVehicleConfirmation(
            "Vehicle deleted successfully.",
            "Vehicle Deleted",
            "OK",
            false,
            "success"
        );


        // Refresh table
        loadVehicles();


    } catch (error) {

        console.error(
            "Error deleting vehicle:",
            error
        );


        alert(error.message);

    }

}



// LOAD VEHICLES WHEN PAGE OPENS


loadVehicles();
loadAssignableSlots();
