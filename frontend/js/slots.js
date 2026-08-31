// PARKING SLOTS PAGE


const SLOT_API_URL = "http://127.0.0.1:8000/parking-slots/";


// LOAD PARKING SLOTS


async function loadParkingSlots() {

    const tableBody =
        document.getElementById("slotTableBody");


    if (!tableBody) {

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


        tableBody.innerHTML = "";


        // No slots

        if (slots.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        style="text-align:center;"
                    >

                        No parking slots found.

                    </td>

                </tr>

            `;

            return;

        }


        // Display slots

        slots.forEach(function (slot) {


            const row =
                document.createElement("tr");


            const status =
                String(slot.status).toLowerCase();


            const statusClass =
                status === "occupied"
                    ? "occupied"
                    : "available";


            row.innerHTML = `

                <td>

                    ${slot.id}

                </td>


                <td>

                    ${slot.slot_number || "-"}

                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}"
                    >

                        ${slot.status || "-"}

                    </span>

                </td>


                <td>


                    <button
                        class="delete-button"
                        onclick="deleteParkingSlot(${slot.id})"
                    >

                        Delete

                    </button>


                </td>

            `;


            tableBody.appendChild(row);


        });


    } catch (error) {


        console.error(
            "Error loading parking slots:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;"
                >

                    Unable to load parking slots.

                </td>

            </tr>

        `;

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




// DELETE PARKING SLOT


async function deleteParkingSlot(slotId) {


    const confirmed =
        confirm(
            "Are you sure you want to delete this parking slot?"
        );


    if (!confirmed) {

        return;

    }


    try {


        const response =
            await fetch(
                `${SLOT_API_URL}${slotId}`,
                {

                    method: "DELETE"

                }
            );


        const result =
            await response.json();


        if (!response.ok) {


            throw new Error(
                result.detail ||
                "Failed to delete parking slot."
            );

        }


        alert(
            "Parking slot deleted successfully."
        );


        loadParkingSlots();


    } catch (error) {


        console.error(
            "Error deleting parking slot:",
            error
        );


        alert(
            error.message
        );

    }

}




// LOAD SLOTS WHEN PAGE OPENS

loadParkingSlots();