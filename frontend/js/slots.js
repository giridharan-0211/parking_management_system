// PARKING SLOTS PAGE


const SLOT_API_URL = "http://127.0.0.1:8000/parking-slots/";


const slotNumberInput = document.getElementById("slotNumber");


if (slotNumberInput) {

    slotNumberInput.addEventListener("keydown", function (event) {

        if (
            (event.key === "Backspace" || event.key === "Delete") &&
            /^[A-Z]-$/.test(slotNumberInput.value)
        ) {
            event.preventDefault();
            slotNumberInput.value = "";
        }

    });

    slotNumberInput.addEventListener("input", function () {

        const typedValue = slotNumberInput.value.toUpperCase();
        const letter = typedValue.match(/[A-Z]/);
        const digits = typedValue.replace(/[^0-9]/g, "").slice(0, 4);

        slotNumberInput.value = letter
            ? `${letter[0]}-${digits}`
            : "";

    });

}


function showSlotConfirmation(
    message,
    title = "Confirm action",
    confirmText = "Confirm",
    showCancel = true,
    iconType = "question",
    cancelText = "Cancel"
) {

    const modal = document.getElementById("slotConfirmModal");
    const titleElement = document.getElementById("slotConfirmTitle");
    const iconElement = document.getElementById("slotConfirmIcon");
    const messageElement = document.getElementById("slotConfirmMessage");
    const confirmButton = document.getElementById("slotConfirmAction");
    const cancelButton = modal.querySelector(".slot-cancel-button");
    const cancelButtons = modal.querySelectorAll("[data-confirm-cancel]");

    titleElement.textContent = title;
    iconElement.textContent = iconType === "success"
        ? String.fromCharCode(10003)
        : iconType === "warning"
            ? String.fromCharCode(9888)
            : "?";
    iconElement.className = `slot-confirm-icon ${iconType}`;
    messageElement.textContent = message;
    confirmButton.textContent = confirmText;
    cancelButton.textContent = cancelText;
    modal.className = `slot-confirm-modal ${iconType}`;
    cancelButtons.forEach(function (button) {
        button.hidden = !showCancel;
    });
    modal.hidden = false;

    return new Promise(function (resolve) {

        function close(result) {
            modal.hidden = true;
            confirmButton.removeEventListener("click", confirmAction);
            modal.querySelectorAll("[data-confirm-cancel]").forEach(function (button) {
                button.removeEventListener("click", cancelAction);
                button.hidden = false;
            });
            cancelButton.textContent = "Cancel";
            resolve(result);
        }

        function confirmAction() {
            close(true);
        }

        function cancelAction() {
            close(false);
        }

        confirmButton.addEventListener("click", confirmAction);
        modal.querySelectorAll("[data-confirm-cancel]").forEach(function (button) {
            button.addEventListener("click", cancelAction);
        });

    });

}


// LOAD PARKING SLOTS


async function loadParkingSlots() {

    const slotGrid =
        document.getElementById("slotGrid");


    if (!slotGrid) {

        return;

    }


    try {


        const response =
            await fetch(SLOT_API_URL);


        if (!response.ok) {

            throw new Error(
                `Failed to load parking slots: ${response.status}`
            );

        }


        const slots =
            await response.json();


        console.log(
            "Parking slots received:",
            slots
        );


        slotGrid.innerHTML = "";


        // No slots

        if (slots.length === 0) {

            slotGrid.innerHTML = "<p>No parking slots found.</p>";

            return;

        }


        // Display slots

        slots.forEach(function (slot) {


            const slotBox =
                document.createElement("div");


            const status =
                String(slot.status).toLowerCase();


            const isArchived = Boolean(slot.is_archived);


            const statusClass =
                isArchived
                    ? "archived"
                    : status === "occupied"
                    ? "occupied"
                    : "available";


            const displayedStatus =
                isArchived ? "Archived" : slot.status || "-";


            slotBox.className = `slot-box ${statusClass}`;

            slotBox.innerHTML = `
                <span class="slot-box-number">${slot.slot_number || "-"}</span>
                <span class="status-badge ${statusClass}">
                    ${displayedStatus}
                </span>
                <button
                    class="${isArchived ? "unarchive-button" : "archive-button"}"
                    onclick="${isArchived ? "unarchiveParkingSlot" : "archiveParkingSlot"}(${slot.id}, '${status}')"
                >
                    ${isArchived ? "Unarchive" : "Archive"}
                </button>
            `;


            slotGrid.appendChild(slotBox);


        });


    } catch (error) {


        console.error(
            "Error loading parking slots:",
            error
        );


        slotGrid.innerHTML = "<p>Unable to load parking slots.</p>";

    }

}


// ADD PARKING SLOT


const slotForm =
    document.getElementById("slotForm");


if (slotForm) {


    slotForm.addEventListener(
        "submit",
        async function (event) {


            event.preventDefault();


            const slotNumber =
                document
                    .getElementById("slotNumber")
                    .value
                    .trim()
                    .toUpperCase();


            const message =
                document.getElementById("slotMessage");


            if (slotNumber === "") {


                message.textContent =
                    "Please enter a slot number.";


                return;

            }

            if (!/^[A-Z]-\d{2,4}$/.test(slotNumber)) {
                message.textContent =
                    "Use the format A-00 to A-0000.";
                return;
            }

            try {

                const existingSlotsResponse = await fetch(SLOT_API_URL);

                if (!existingSlotsResponse.ok) {
                    throw new Error("Unable to check existing parking slots.");
                }

                const existingSlots = await existingSlotsResponse.json();
                const slotAlreadyExists = existingSlots.some(function (slot) {
                    return String(slot.slot_number).trim().toUpperCase() === slotNumber;
                });

                if (slotAlreadyExists) {
                    const reenterSlot = await showSlotConfirmation(
                        "This parking slot number already exists.",
                        "Slot Already Exists",
                        "Re-enter Slot Number",
                        true,
                        "warning",
                        "Cancel"
                    );

                    if (reenterSlot) {
                        const slotNumberInput = document.getElementById("slotNumber");
                        slotNumberInput.focus();
                        slotNumberInput.select();
                    }

                    return;
                }

                const confirmed = await showSlotConfirmation(
                    "Do you want to add this new parking slot?",
                    "Add Parking Slot",
                    "Confirm",
                    true,
                    "success"
                );

                if (!confirmed) {
                    return;
                }


                const response =
                    await fetch(
                        SLOT_API_URL,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                slot_number:
                                    slotNumber,

                                status:
                                    "available"

                            })

                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Slot API response:",
                    result
                );


                if (!response.ok) {


                    let errorMessage =
                        "Failed to add parking slot.";


                    if (result.detail) {


                        if (
                            Array.isArray(
                                result.detail
                            )
                        ) {


                            errorMessage =
                                result.detail
                                    .map(
                                        error =>
                                            error.msg
                                    )
                                    .join(", ");


                        } else {


                            errorMessage =
                                result.detail;

                        }

                    }


                    throw new Error(
                        errorMessage
                    );

                }


                await showSlotConfirmation(
                    "Parking slot added successfully!",
                    "Parking Slot Added",
                    "OK",
                    false,
                    "success"
                );


                slotForm.reset();


                loadParkingSlots();


            } catch (error) {


                console.error(
                    "Error adding parking slot:",
                    error
                );


                message.textContent =
                    error.message;

            }

        }
    );

}




// ARCHIVE AND UNARCHIVE PARKING SLOTS


async function updateSlotArchiveStatus(slotId, action) {


    try {


        const response =
            await fetch(
                `${SLOT_API_URL}${slotId}/${action}`,
                {

                    method: "PATCH"

                }
            );


        const result =
            await response.json();


        if (!response.ok) {


            throw new Error(
                result.detail ||
                `Failed to ${action} parking slot.`
            );

        }

        loadParkingSlots();


    } catch (error) {


        console.error(
            `Error trying to ${action} parking slot:`,
            error
        );


        alert(
            error.message
        );

    }

}


async function archiveParkingSlot(slotId, status) {

    if (status === "occupied") {
        await showSlotConfirmation(
            "Occupied slot cannot be archived.",
            "Cannot Archive Slot",
            "OK",
            false,
            "warning"
        );
        return;
    }

    const confirmed = await showSlotConfirmation(
        "Are you sure you want to archive this slot?",
        "Archive Parking Slot",
        "Confirm",
        true,
        "warning"
    );

    if (!confirmed) {
        return;
    }

    updateSlotArchiveStatus(slotId, "archive");

}


async function unarchiveParkingSlot(slotId) {

    const confirmed = await showSlotConfirmation(
        "Do you want to unarchive this parking slot?",
        "Unarchive Parking Slot",
        "Confirm",
        true,
        "success"
    );

    if (!confirmed) {
        return;
    }

    updateSlotArchiveStatus(slotId, "unarchive");

}


loadParkingSlots();
