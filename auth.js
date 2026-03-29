/************************
  STORAGE HELPERS
************************/
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/************************
  AUTH STATE
************************/
function getCurrentUserEmail() {
  return localStorage.getItem("currentUser");
}

function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;

  const users = getUsers();
  return users[email] || null;
}

function isAuthenticated() {
  return !!getCurrentUserEmail();
}

/************************
  REGISTER (NEW USER ONLY)
************************/
function registerUser({ email, password, salary, savingsTarget }) {
  if (!email || !password) return false;

  const users = getUsers();

  // ❌ already exists
  if (users[email]) {
    return false;
  }

  users[email] = {
    email,
    password, // ⚠️ local-only (OK for project)
    salary,
    savingsTarget,
    expenses: [],
    payments: []
  };

  saveUsers(users);
  return true;
}

/************************
  LOGIN (EXISTING USER ONLY)
************************/
function loginUser({ email, password }) {
  if (!email || !password) return false;

  const users = getUsers();
  const user = users[email];

  if (!user) return false;
  if (user.password !== password) return false;

  localStorage.setItem("currentUser", email);
  return true;
}

/************************
  LOGOUT
************************/
function logout() {
  localStorage.removeItem("currentUser");
  alert("Logged out successfully");
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", e => {
    e.preventDefault();   // ⛔ stop navigation
    logout();
    document.location.href = "index.html";
  });
});
