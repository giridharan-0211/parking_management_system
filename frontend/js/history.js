const API_URL = "http://127.0.0.1:8000";

const historyTableBody =
    document.getElementById("historyTableBody");

const historyMessage =
    document.getElementById("historyMessage");


async function loadParkingHistory() {

    try {

        const response =
            await fetch(`${API_URL}/parking/records`);

        if (!response.ok) {

            throw new Error("Failed to load parking records.");

        }

        const records = await response.json();

        historyTableBody.innerHTML = "";

        if (records.length === 0) {

            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No parking records found.
                    </td>
                </tr>
            `;

            return;
        }


        records.forEach(record => {

            const row = document.createElement("tr");

            const entryTime =
                record.entry_time
                    ? new Date(record.entry_time).toLocaleString()
                    : "-";

            const exitTime =
                record.exit_time
                    ? new Date(record.exit_time).toLocaleString()
                    : "-";


            const status =
                record.exit_time
                    ? "Exited"
                    : "Parked";


            row.innerHTML = `

                <td>${record.vehicle_number || "-"}</td>

                <td>${record.slot_number || "-"}</td>

                <td>${entryTime}</td>

                <td>${exitTime}</td>

                <td>
                    <span class="status-badge ${status === "Parked" ? "occupied" : "available"}">
                        ${status}
                    </span>
                </td>

            `;


            historyTableBody.appendChild(row);

        });

    }

    catch (error) {

        console.error(error);

        historyTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load parking history.
                </td>
            </tr>
        `;

        historyMessage.textContent =
            "Unable to connect to the backend API.";

    }

}


loadParkingHistory();