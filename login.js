
const API_URL = "http://localhost:5000/api";

const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("libraryToken", data.token);
        localStorage.setItem("libraryUser", JSON.stringify(data.user));

        if (data.user.role === "admin") {
            alert("Admin login successful!");
            window.location.href = "admin.html";
        } 
        else if (data.user.role === "student") {
            alert("Student login successful!");
            window.location.href = "student.html";
        } 
        else {
            alert("Invalid account role.");
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Cannot connect to the server. Please check whether the backend is running.");
    }
});
