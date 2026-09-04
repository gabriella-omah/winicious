const loginForm = document.getElementById("adminLoginForm");
const loginError = document.getElementById("loginError");
loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
    if (error) {
        console.error("Login error:", error);
        loginError.textContent = "Invalid email or password.";
        return;
    }
    if (!data.session) {
        loginError.textContent = "Login failed. Please try again.";
        return;
    }
    window.location.href = "admin.html";
});