/* ===== new-order.js: order form with live product preview ===== */

const form = document.getElementById("orderForm");
const sizeSel = document.getElementById("size");
const designInput = document.getElementById("design");
const qtyInput = document.getElementById("qty");
const deadlineInput = document.getElementById("deadline");
const deadlineHint = document.getElementById("deadlineHint");
const stage = document.getElementById("previewStage");
const previewTitle = document.getElementById("previewTitle");
const priceBox = document.getElementById("priceEstimate");
const errorBox = document.getElementById("orderError");
const cardsBox = document.getElementById("productCards");
const swatchBox = document.getElementById("swatches");

// Current choices
let selectedProduct = "T-shirt";
let selectedColor = "Black";

// The earliest date depends on the quantity; the latest is 180 days ahead
function updateDeadlineLimits() {
  const qty = parseInt(qtyInput.value) || 1;
  const days = leadDays(qty);
  const earliest = addDays(days);

  deadlineInput.min = earliest;
  deadlineInput.max = addDays(MAX_DAYS_AHEAD);
  deadlineHint.textContent = "Production takes about " + days + " days for " + qty + " piece(s). Earliest date: " + formatDate(earliest) + ".";

  // Clear a date that is now too early
  if (deadlineInput.value && deadlineInput.value < earliest) deadlineInput.value = "";
}

// Build the product picture cards
Object.keys(PRICES).forEach(function (name) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "product-card";
  btn.dataset.product = name;
  btn.innerHTML =
    '<div class="product-thumb">' + productSvg(name, "Black", "") + '</div>' +
    '<span>' + name + '</span>' +
    '<small>RM ' + PRICES[name] + '</small>';
  btn.addEventListener("click", function () {
    selectedProduct = name;
    updatePreview();
  });
  cardsBox.appendChild(btn);
});

// Build the colour swatches
Object.keys(COLORS).forEach(function (name) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "swatch";
  btn.dataset.color = name;
  btn.title = name;
  btn.setAttribute("aria-label", name);
  btn.style.background = COLORS[name].hex;
  btn.addEventListener("click", function () {
    selectedColor = name;
    updatePreview();
  });
  swatchBox.appendChild(btn);
});

// Tote bags and caps have no size
function hasNoSize() {
  return selectedProduct === "Tote bag" || selectedProduct === "Cap";
}

// Refresh the picture, the highlighted choices, the price and the date limits
function updatePreview() {
  stage.innerHTML = productSvg(selectedProduct, selectedColor, designInput.value.trim());

  document.querySelectorAll(".product-card").forEach(function (b) {
    b.classList.toggle("active", b.dataset.product === selectedProduct);
  });
  document.querySelectorAll(".swatch").forEach(function (b) {
    b.classList.toggle("active", b.dataset.color === selectedColor);
  });

  sizeSel.disabled = hasNoSize();
  previewTitle.textContent = selectedProduct + " \u00B7 " + selectedColor;

  const qty = parseInt(qtyInput.value) || 0;
  priceBox.textContent = "RM " + (PRICES[selectedProduct] * qty).toFixed(2);
  updateDeadlineLimits();
}

designInput.addEventListener("input", updatePreview);
qtyInput.addEventListener("input", updatePreview);
updatePreview();

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const design = designInput.value.trim();
  const qty = parseInt(qtyInput.value);
  const deadline = deadlineInput.value;

  // Validation with clear messages
  if (design === "") { showError("Please enter a design name."); return; }
  if (!qty || qty < 1) { showError("Quantity must be at least 1."); return; }
  if (deadline === "") { showError("Please choose the date you need it by."); return; }
  if (daysUntil(deadline) < 0) { showError("That date has already passed. Please choose a future date."); return; }

  const earliest = addDays(leadDays(qty));
  if (deadline < earliest) {
    showError("That is too soon. For " + qty + " piece(s) the earliest date is " + formatDate(earliest) + ".");
    return;
  }
  if (deadline > addDays(MAX_DAYS_AHEAD)) {
    showError("That date is too far ahead. Please choose a date within " + MAX_DAYS_AHEAD + " days.");
    return;
  }

  const user = currentUser();

  const newOrder = {
    id: "SK-" + (1001 + orders.length),
    customer: user.name,
    product: selectedProduct,
    color: selectedColor,
    design: design,
    size: hasNoSize() ? "-" : sizeSel.value,
    qty: qty,
    deadline: deadline,
    price: PRICES[selectedProduct] * qty,
    status: "Pending",
    created: todayString()
  };

  // Save in the browser so it stays after refresh
  const saved = JSON.parse(localStorage.getItem("newOrders")) || [];
  saved.push(newOrder);
  localStorage.setItem("newOrders", JSON.stringify(saved));

  window.location.href = "portal.html";
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}