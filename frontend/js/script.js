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
