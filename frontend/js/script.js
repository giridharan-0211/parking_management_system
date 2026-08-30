// LOGIN FUNCTIONALITY -----------------------------------

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const loginMessage = document.getElementById("loginMessage");


    if (username === "" || password === "") {

        loginMessage.textContent = "Please enter username and password.";

        return;
    }


    if (username === "admin" && password === "admin123") {

        loginMessage.textContent = "Login successful!";

        setTimeout(function () {
            window.location.href = "pages/dashboard.html";
        }, 500);

    } else {

        loginMessage.textContent = "Invalid username or password.";

    }

});


// PARKING DATA -----------------------------------


const parkingSlots = [
    { slotNumber: "A-01", status: "occupied" },
    { slotNumber: "A-02", status: "available" },
    { slotNumber: "A-03", status: "occupied" },
    { slotNumber: "A-04", status: "available" },
    { slotNumber: "B-01", status: "available" },
    { slotNumber: "B-02", status: "occupied" },
    { slotNumber: "B-03", status: "available" },
    { slotNumber: "B-04", status: "available" }
];

function updateDashboardStats() {

    const totalSlots = parkingSlots.length;

    const occupiedSlots = parkingSlots.filter(
        slot => slot.status === "occupied"
    ).length;

    const availableSlots = parkingSlots.filter(
        slot => slot.status === "available"
    ).length;


    document.getElementById("totalSlots").textContent = totalSlots;

    document.getElementById("occupiedSlots").textContent = occupiedSlots;

    document.getElementById("availableSlots").textContent = availableSlots;

    document.getElementById("parkedVehicles").textContent = occupiedSlots;
}
updateDashboardStats();