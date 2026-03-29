document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", e => {
    e.preventDefault();
    logout();

    // Replace page content instead of redirect
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Segoe UI,sans-serif;
      ">
        <div style="text-align:center">
          <h2>Logged out successfully</h2>
          <a href="index.html"
             style="
               display:inline-block;
               margin-top:1rem;
               padding:.6rem 1.2rem;
               background:#2563eb;
               color:#fff;
               border-radius:8px;
               text-decoration:none;
             ">
             Go to Login
          </a>
        </div>
      </div>
    `;
  });
});
