/* =========================
   LOGIN
========================= */
document
  .getElementById("loginForm")
  .addEventListener("submit", e => {
    e.preventDefault();

    const email =
      document.getElementById("email").value.trim();
    const password =
      document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    const users =
      JSON.parse(localStorage.getItem("users")) || {};

    if (!users[email]) {
      alert("Account not found. Please register.");
      return;
    }

    if (users[email].password !== password) {
      alert("Invalid email or password");
      return;
    }

    localStorage.setItem("currentUser", email);

    // No location redirect — user clicks link
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Segoe UI,sans-serif;
      ">
        <div style="text-align:center">
          <h2>Login successful ✅</h2>
          <p>Continue to your dashboard</p>
          <a href="dashboard.html"
             style="
               display:inline-block;
               margin-top:1rem;
               padding:.6rem 1.2rem;
               background:#2563eb;
               color:#fff;
               border-radius:8px;
               text-decoration:none;
             ">
             Go to Dashboard
          </a>
        </div>
      </div>
    `;
  });

/* =========================
   FORGOT PASSWORD
========================= */
document
  .getElementById("forgotPassword")
  ?.addEventListener("click", e => {
    e.preventDefault();

    const email = prompt("Enter your registered email:");
    if (!email) return;

    const users =
      JSON.parse(localStorage.getItem("users")) || {};

    if (!users[email]) {
      alert("No account found with this email.");
      return;
    }

    alert(
      "Demo reset only.\nYour password is:\n" +
      users[email].password
    );
  });
