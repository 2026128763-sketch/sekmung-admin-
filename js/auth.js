/* ===== auth.js: accounts and session helpers (simulated, no database) ===== */

// Staff accounts (hardcoded)
const STAFF = [
  { username: "admin", pin: "2026", name: "Admin" }
];

// Customer accounts live in the browser (localStorage)
function getCustomers() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("customers")) || [];
  } catch (e) {
    list = [];
  }

  // Demo customer so the app always has one account to test
  const hasDemo = list.some(function (c) { return c.email === "aiman@example.com"; });
  if (!hasDemo) {
    list.push({ name: "Aiman Hakim", email: "aiman@example.com", password: "user123" });
    saveCustomers(list);
  }
  return list;
}

function saveCustomers(list) {
  localStorage.setItem("customers", JSON.stringify(list));
}

// Get the logged-in user (or null)
function currentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch (e) {
    return null;
  }
}

// Each role has its own landing page
function homeFor(user) {
  return user.role === "admin" ? "dashboard.html" : "portal.html";
}

// Save the session and go to the user's landing page
function startSession(user) {
  sessionStorage.setItem("user", JSON.stringify(user));
  window.location.href = homeFor(user);
}

// Used by other pages: must be logged in, and have the right role
function requireLogin(role) {
  const user = currentUser();
  if (!user) {
    window.location.href = "index.html";
    return false;
  }
  if (role && user.role !== role) {
    window.location.href = homeFor(user);
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.removeItem("user");
  window.location.href = "index.html";
}