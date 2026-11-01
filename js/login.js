/* ===== login.js: entry screen (landing page, staff PIN pad, customer login/register/reset) ===== */

// Already logged in? Go straight to the right page
const existing = currentUser();
if (existing) {
  window.location.href = homeFor(existing);
}

// ---------- Helpers ----------
function showMessage(box, text) {
  box.textContent = text;
  box.classList.remove("d-none");
}
function hideMessage(box) {
  box.classList.add("d-none");
}

// ---------- Switching between the three views ----------
const views = {
  doors: document.getElementById("viewDoors"),
  customer: document.getElementById("viewCustomer"),
  staff: document.getElementById("viewStaff")
};

function showView(name) {
  Object.keys(views).forEach(function (key) {
    views[key].classList.toggle("d-none", key !== name);
  });
  window.scrollTo(0, 0);
}

document.getElementById("doorCustomer").addEventListener("click", function () { showView("customer"); });
document.getElementById("doorStaff").addEventListener("click", function () { showView("staff"); });

document.querySelectorAll("[data-back]").forEach(function (btn) {
  btn.addEventListener("click", function () { showView("doors"); });
});

// ---------- Customer: tabs and show/hide password ----------
const customerError = document.getElementById("customerError");
const loginForm = document.getElementById("customerLoginForm");
const registerForm = document.getElementById("registerForm");

document.querySelectorAll(".auth-tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    const isLogin = tab.dataset.tab === "login";
    document.querySelectorAll(".auth-tab").forEach(function (t) {
      t.classList.toggle("active", t === tab);
    });
    loginForm.classList.toggle("d-none", !isLogin);
    registerForm.classList.toggle("d-none", isLogin);
    hideMessage(customerError);
  });
});

document.querySelectorAll(".pw-toggle").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const input = document.getElementById(btn.dataset.toggle);
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    btn.textContent = hidden ? "Hide" : "Show";
  });
});

// ---------- Customer: log in ----------
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value;

  if (email === "" || pass === "") {
    showMessage(customerError, "Please enter both email and password.");
    return;
  }

  const found = getCustomers().find(function (c) {
    return c.email === email && c.password === pass;
  });

  if (!found) {
    showMessage(customerError, "Invalid email or password.");
    return;
  }

  startSession({ username: found.email, role: "customer", name: found.name });
});

// ---------- Customer: register ----------
const regPassword = document.getElementById("regPassword");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

// Score 0 to 4: length, upper + lower case, number, symbol
function passwordScore(p) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

regPassword.addEventListener("input", function () {
  const p = regPassword.value;
  const score = passwordScore(p);
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];

  strengthBar.style.width = (p === "" ? 0 : Math.max(score, 1) * 25) + "%";
  strengthBar.className = "strength-bar strength-" + (p === "" ? 0 : Math.max(score, 1));
  strengthText.textContent = p === "" ? "" : "Password strength: " + labels[score];
});

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const pass = regPassword.value;
  const confirmPass = document.getElementById("regConfirm").value;

  if (name.length < 2) { showMessage(customerError, "Please enter your full name."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMessage(customerError, "Please enter a valid email address."); return; }
  if (pass.length < 6) { showMessage(customerError, "Password must be at least 6 characters."); return; }
  if (pass !== confirmPass) { showMessage(customerError, "Passwords do not match."); return; }

  const customers = getCustomers();
  const taken = customers.some(function (c) { return c.email === email; });
  if (taken) { showMessage(customerError, "This email is already registered. Try logging in."); return; }

  customers.push({ name: name, email: email, password: pass });
  saveCustomers(customers);

  // Log the new customer in straight away
  startSession({ username: email, role: "customer", name: name });
});

// ---------- Staff: PIN pad ----------
const PIN_LENGTH = 4;
const MAX_TRIES = 3;
const LOCK_SECONDS = 30;

const staffError = document.getElementById("staffError");
const staffUser = document.getElementById("staffUser");
const pinDots = document.getElementById("pinDots");
const keypad = document.getElementById("keypad");

let pin = "";
let tries = 0;
let lockTimer = null;

// Build the keypad buttons
["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "\u232B"].forEach(function (k) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "key";
  btn.textContent = k;
  btn.addEventListener("click", function () {
    if (k === "C") resetPin();
    else if (k === "\u232B") backspace();
    else addDigit(k);
  });
  keypad.appendChild(btn);
});

function updateDots() {
  pinDots.querySelectorAll("span").forEach(function (dot, i) {
    dot.classList.toggle("filled", i < pin.length);
  });
}

function resetPin() {
  pin = "";
  updateDots();
}

function backspace() {
  pin = pin.slice(0, -1);
  updateDots();
}

function addDigit(d) {
  if (isLocked() || pin.length >= PIN_LENGTH) return;
  pin += d;
  updateDots();
  if (pin.length === PIN_LENGTH) checkPin();
}

function checkPin() {
  const username = staffUser.value.trim().toLowerCase();

  if (username === "") {
    showMessage(staffError, "Enter your username first.");
    resetPin();
    staffUser.focus();
    return;
  }

  const found = STAFF.find(function (s) { return s.username === username && s.pin === pin; });

  if (found) {
    startSession({ username: found.username, role: "admin", name: found.name });
    return;
  }

  // Wrong PIN: shake the dots and count the attempt
  tries++;
  pinDots.classList.add("shake");
  setTimeout(function () {
    pinDots.classList.remove("shake");
    resetPin();
  }, 400);

  if (tries >= MAX_TRIES) {
    startLock();
  } else {
    showMessage(staffError, "Wrong username or PIN. " + (MAX_TRIES - tries) + " attempt(s) left.");
  }
}

// Lock the keypad for 30 seconds after 3 wrong tries
function lockRemaining() {
  const until = Number(localStorage.getItem("staffLockUntil")) || 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function isLocked() {
  return lockRemaining() > 0;
}

function startLock() {
  localStorage.setItem("staffLockUntil", Date.now() + LOCK_SECONDS * 1000);
  tries = 0;
  runLockTimer();
}

function runLockTimer() {
  clearInterval(lockTimer);
  updateLock();
  lockTimer = setInterval(updateLock, 1000);
}

function updateLock() {
  const left = lockRemaining();
  if (left > 0) {
    showMessage(staffError, "Too many attempts. Try again in " + left + " seconds.");
    keypad.classList.add("locked");
  } else {
    clearInterval(lockTimer);
    hideMessage(staffError);
    keypad.classList.remove("locked");
  }
}

if (isLocked()) runLockTimer();

// Also allow the physical keyboard on the PIN pad
document.addEventListener("keydown", function (e) {
  if (views.staff.classList.contains("d-none")) return;
  if (document.activeElement === staffUser) return;
  if (/^\d$/.test(e.key)) addDigit(e.key);
  else if (e.key === "Backspace") backspace();
});

// ---------- Landing page: floating product collage ----------
const heroItems = [
  { product: "T-shirt", color: "Black", text: "sekmung" },
  { product: "Hoodie", color: "Red", text: "Night Script" },
  { product: "Cap", color: "Navy", text: "Mono" },
  { product: "Tote bag", color: "Olive", text: "Wave Logo" }
];

document.getElementById("heroArt").innerHTML = heroItems.map(function (h) {
  return '<div class="tile">' +
    productSvg(h.product, h.color, h.text) +
    '<div class="tile-label"><span>' + h.product + '</span><small>RM ' + PRICES[h.product] + '</small></div>' +
    '</div>';
}).join("");

// ---------- Customer: forgot password ----------
const forgotForm = document.getElementById("forgotForm");
const resetForm = document.getElementById("resetForm");
const customerNotice = document.getElementById("customerNotice");
const authTabs = document.querySelector(".auth-tabs");
const demoInbox = document.getElementById("demoInbox");
const resetInfo = document.getElementById("resetInfo");

const CODE_MINUTES = 5;
const MAX_CODE_TRIES = 3;

// The code that is currently valid: { email, code, expires, tries }
let resetState = null;

// a***@example.com
function maskEmail(email) {
  const parts = email.split("@");
  return parts[0].slice(0, 1) + "***@" + parts[1];
}

// Switch the customer card between its screens
function showCustomerScreen(screen) {
  const inReset = screen === "forgot" || screen === "reset";
  authTabs.classList.toggle("d-none", inReset);
  loginForm.classList.toggle("d-none", screen !== "login");
  registerForm.classList.toggle("d-none", screen !== "register");
  forgotForm.classList.toggle("d-none", screen !== "forgot");
  resetForm.classList.toggle("d-none", screen !== "reset");
  hideMessage(customerError);
  hideMessage(customerNotice);
}

// Create a new 6-digit code and show it in the demo inbox
function issueCode(email) {
  resetState = {
    email: email,
    code: String(Math.floor(100000 + Math.random() * 900000)),
    expires: Date.now() + CODE_MINUTES * 60 * 1000,
    tries: 0
  };

  resetInfo.textContent = "We sent a 6-digit code to " + maskEmail(email) + ". It expires in " + CODE_MINUTES + " minutes.";
  demoInbox.innerHTML =
    '<span class="demo-tag">Demo inbox</span>' +
    '<p class="mb-1">From: sekmung &lt;noreply@sekmung.demo&gt;</p>' +
    '<p class="mb-1">Your password reset code is <strong class="demo-code">' + resetState.code + '</strong></p>' +
    '<p class="demo-note mb-0">A front-end only prototype cannot send real emails, so the code is shown here.</p>';
  document.getElementById("resetCode").value = "";
}

// "Forgot password?" link on the login form
document.getElementById("forgotLink").addEventListener("click", function () {
  document.getElementById("forgotEmail").value = document.getElementById("loginEmail").value;
  showCustomerScreen("forgot");
});

// "Back to log in" links
document.querySelectorAll("[data-to-login]").forEach(function (btn) {
  btn.addEventListener("click", function () { showCustomerScreen("login"); });
});

// Step 1: ask for the email and send the code
forgotForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage(customerError, "Please enter a valid email address.");
    return;
  }

  const exists = getCustomers().some(function (c) { return c.email === email; });
  if (!exists) {
    showMessage(customerError, "No account found with this email.");
    return;
  }

  issueCode(email);
  showCustomerScreen("reset");
});

// "Send a new code" link
document.getElementById("resendCode").addEventListener("click", function () {
  if (!resetState) return;
  issueCode(resetState.email);
  hideMessage(customerError);
  showMessage(customerNotice, "A new code has been sent.");
});

// Step 2: check the code and save the new password
resetForm.addEventListener("submit", function (e) {
  e.preventDefault();
  hideMessage(customerNotice);

  const code = document.getElementById("resetCode").value.trim();
  const pass = document.getElementById("resetPassword").value;
  const confirmPass = document.getElementById("resetConfirm").value;

  if (code === "") { showMessage(customerError, "Enter the 6-digit code."); return; }
  if (pass.length < 6) { showMessage(customerError, "Password must be at least 6 characters."); return; }
  if (pass !== confirmPass) { showMessage(customerError, "Passwords do not match."); return; }

  if (!resetState) {
    showMessage(customerError, "Please request a new code.");
    return;
  }
  if (Date.now() > resetState.expires) {
    showMessage(customerError, "This code has expired. Send a new code.");
    return;
  }
  if (resetState.tries >= MAX_CODE_TRIES) {
    showMessage(customerError, "Too many wrong attempts. Send a new code.");
    return;
  }

  if (code !== resetState.code) {
    resetState.tries++;
    const left = MAX_CODE_TRIES - resetState.tries;
    showMessage(customerError, left > 0
      ? "Wrong code. " + left + " attempt(s) left."
      : "Too many wrong attempts. Send a new code.");
    return;
  }

  // Correct code: check the new password, then save it
  const customers = getCustomers();
  const account = customers.find(function (c) { return c.email === resetState.email; });

  // The new password must be different from the current one
  if (pass === account.password) {
    showMessage(customerError, "Your new password must be different from your old password.");
    return;
  }

  account.password = pass;
  saveCustomers(customers);

  const email = resetState.email;
  resetState = null;
  resetForm.reset();

  showCustomerScreen("login");
  document.getElementById("loginEmail").value = email;
  document.getElementById("loginPassword").value = "";
  showMessage(customerNotice, "Password updated. You can now log in with your new password.");
});

// ---------- Landing page clock ----------
startClock(document.getElementById("landingClock"));