// =====================================================
// VEHICLES PAGE
// =====================================================

const VEHICLE_API_URL = "http://127.0.0.1:8000/vehicles/";


// =====================================================
// LOAD VEHICLES
// =====================================================

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
                    <td colspan="6" style="text-align:center;">
                        No vehicles registered.
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
                <td colspan="6" style="text-align:center;">
                    Unable to load vehicles.
                </td>
            </tr>
        `;

    }

}


// =====================================================
// ADD VEHICLE
// =====================================================

const vehicleForm =
    document.getElementById("vehicleForm");


if (vehicleForm) {

    vehicleForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const vehicleNumber =
                document.getElementById("vehicleNumber")
                    .value
                    .trim();


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


            const message =
                document.getElementById("vehicleMessage");


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

                            contact_number: contactNumber

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
                message.textContent =
                    "Vehicle added successfully!";


                // Clear form
                vehicleForm.reset();


                // Refresh table
                loadVehicles();


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


// =====================================================
// DELETE VEHICLE
// =====================================================

async function deleteVehicle(vehicleId) {

    const confirmed = confirm(
        "Are you sure you want to delete this vehicle?"
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


        alert(
            "Vehicle deleted successfully."
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


// =====================================================
// LOAD VEHICLES WHEN PAGE OPENS
// =====================================================

loadVehicles();