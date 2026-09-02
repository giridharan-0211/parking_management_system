// PARKING SLOTS PAGE


const SLOT_API_URL = "http://127.0.0.1:8000/parking-slots/";


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
                    onclick="${isArchived ? "unarchiveParkingSlot" : "archiveParkingSlot"}(${slot.id})"
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
                    .trim();


            const slotStatus =
                document
                    .getElementById("slotStatus")
                    .value;


            const message =
                document.getElementById("slotMessage");


            if (slotNumber === "") {


                message.textContent =
                    "Please enter a slot number.";


                return;

            }


            try {


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
                                    slotStatus

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


                message.textContent =
                    "Parking slot added successfully!";


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


function archiveParkingSlot(slotId) {

    updateSlotArchiveStatus(slotId, "archive");

}


function unarchiveParkingSlot(slotId) {

    updateSlotArchiveStatus(slotId, "unarchive");

}
