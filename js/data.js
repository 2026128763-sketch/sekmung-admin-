/* ===== data.js: demo data, saved changes, stock rules, dates and clock ===== */

// ---------- Orders (all fictional; deadlines are relative to today) ----------
const orders = [
  { id: "SK-1001", customer: "Aiman Hakim",     product: "T-shirt",  design: "Wave Logo",    size: "L",  qty: 2,  deadline: addDays(9),  price: 90,   status: "Pending" },
  { id: "SK-1002", customer: "Nurul Izzah",     product: "Hoodie",   design: "Night Script", size: "M",  qty: 1,  deadline: addDays(6),  price: 95,   status: "Printing" },
  { id: "SK-1003", customer: "Farhan Syukri",   product: "T-shirt",  design: "Block Text",   size: "XL", qty: 10, deadline: addDays(12), price: 450,  status: "Printing" },
  { id: "SK-1004", customer: "Aiman Hakim",     product: "Tote bag", design: "Minimal S",    size: "-",  qty: 5,  deadline: addDays(4),  price: 100,  status: "Packed" },
  { id: "SK-1005", customer: "Hafiz Danial",    product: "Cap",      design: "Mono Cap",     size: "-",  qty: 3,  deadline: addDays(2),  price: 105,  status: "Shipped" },
  { id: "SK-1006", customer: "Amirah Zulkifli", product: "Hoodie",   design: "Club Crest",   size: "L",  qty: 20, deadline: addDays(20), price: 1700, status: "Pending" },
  { id: "SK-1007", customer: "Aiman Hakim",     product: "T-shirt",  design: "Wave Logo",    size: "M",  qty: 1,  deadline: addDays(-8), price: 45,   status: "Delivered" },
  { id: "SK-1008", customer: "Liyana Roslan",   product: "T-shirt",  design: "Night Script", size: "S",  qty: 4,  deadline: addDays(-6), price: 180,  status: "Delivered" },
  { id: "SK-1009", customer: "Zul Kamal",       product: "Cap",      design: "Block Text",   size: "-",  qty: 8,  deadline: addDays(10), price: 280,  status: "Printing" },
  { id: "SK-1010", customer: "Dania Farhana",   product: "Hoodie",   design: "Minimal S",    size: "M",  qty: 2,  deadline: addDays(14), price: 190,  status: "Pending" },
  { id: "SK-1011", customer: "Irfan Zakaria",   product: "Tote bag", design: "Wave Logo",    size: "-",  qty: 6,  deadline: addDays(-1), price: 120,  status: "Packed" },
  { id: "SK-1012", customer: "Hanis Sofea",     product: "T-shirt",  design: "Club Crest",   size: "L",  qty: 15, deadline: addDays(16), price: 675,  status: "Pending" }
];

// Production steps, in order (used for filters, charts and trackers)
const statusList = ["Pending", "Printing", "Packed", "Shipped", "Delivered"];

// ---------- Materials ----------
const materials = [
  { item: "Blank T-shirt (Black)",    category: "Blanks",    supplier: "Kain Prima Sdn Bhd",  stock: 120, reorder: 50,  unitCost: 12.50 },
  { item: "Blank T-shirt (White)",    category: "Blanks",    supplier: "Kain Prima Sdn Bhd",  stock: 35,  reorder: 50,  unitCost: 12.50 },
  { item: "Blank Hoodie (Black)",     category: "Blanks",    supplier: "Kain Prima Sdn Bhd",  stock: 40,  reorder: 20,  unitCost: 38.00 },
  { item: "Baseball Cap (Black)",     category: "Blanks",    supplier: "Topi Jaya Supplies",  stock: 18,  reorder: 25,  unitCost: 8.00 },
  { item: "Canvas Tote Bag",          category: "Blanks",    supplier: "Beg Kita Enterprise", stock: 60,  reorder: 30,  unitCost: 5.50 },
  { item: "Screen Print Ink (White)", category: "Ink",       supplier: "Warna Print Trading", stock: 9,   reorder: 10,  unitCost: 45.00 },
  { item: "Screen Print Ink (Black)", category: "Ink",       supplier: "Warna Print Trading", stock: 14,  reorder: 10,  unitCost: 45.00 },
  { item: "Neck Label (Woven)",       category: "Labels",    supplier: "Label Pro Malaysia",  stock: 500, reorder: 200, unitCost: 0.40 },
  { item: "Poly Mailer Bag",          category: "Packaging", supplier: "Pek Cepat Sdn Bhd",   stock: 150, reorder: 100, unitCost: 0.60 },
  { item: "Thank-you Card",           category: "Packaging", supplier: "Label Pro Malaysia",  stock: 80,  reorder: 100, unitCost: 0.25 }
];

// Price per piece (used by the order form)
const PRICES = { "T-shirt": 45, "Hoodie": 95, "Tote bag": 20, "Cap": 35 };

// Stops customer text from being read as HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Load changes saved in the browser ----------
// Orders added by customers
try {
  const saved = JSON.parse(localStorage.getItem("newOrders")) || [];
  saved.forEach(function (o) { orders.push(o); });
} catch (e) {
  console.log("No saved orders found.");
}

// Status changes made by the admin
try {
  const overrides = JSON.parse(localStorage.getItem("statusOverrides")) || {};
  orders.forEach(function (o) {
    if (overrides[o.id]) o.status = overrides[o.id];
  });
} catch (e) {
  console.log("No saved status changes found.");
}

// Dates when each order reached each status
function getStatusLog() {
  try {
    return JSON.parse(localStorage.getItem("statusLog")) || {};
  } catch (e) {
    return {};
  }
}

// ---------- Stock ----------
// Apply saved stock levels (restocks and used materials)
try {
  const savedStock = JSON.parse(localStorage.getItem("stockLevels")) || {};
  materials.forEach(function (m) {
    if (savedStock[m.item] !== undefined) m.stock = savedStock[m.item];
  });
} catch (e) {
  console.log("No saved stock levels found.");
}

// Save the current stock of every material
function saveStock() {
  const levels = {};
  materials.forEach(function (m) { levels[m.item] = m.stock; });
  localStorage.setItem("stockLevels", JSON.stringify(levels));
}

// Which orders have already used up their materials
function getDeducted() {
  try {
    return JSON.parse(localStorage.getItem("stockDeducted")) || {};
  } catch (e) {
    return {};
  }
}

// Materials one order needs to be produced
function materialsNeeded(order) {
  const colorName = order.color || "Black";
  const needs = [];

  // The blank product
  if (order.product === "T-shirt") {
    needs.push({ item: colorName === "White" ? "Blank T-shirt (White)" : "Blank T-shirt (Black)", qty: order.qty });
  }
  if (order.product === "Hoodie") needs.push({ item: "Blank Hoodie (Black)", qty: order.qty });
  if (order.product === "Cap") needs.push({ item: "Baseball Cap (Black)", qty: order.qty });
  if (order.product === "Tote bag") needs.push({ item: "Canvas Tote Bag", qty: order.qty });

  // Ink: 1 bottle per 10 pieces, white ink on dark products, black ink on white ones
  needs.push({
    item: colorName === "White" ? "Screen Print Ink (Black)" : "Screen Print Ink (White)",
    qty: Math.ceil(order.qty / 10)
  });

  // Neck labels only go on clothing
  if (order.product === "T-shirt" || order.product === "Hoodie") {
    needs.push({ item: "Neck Label (Woven)", qty: order.qty });
  }

  // Packaging: 1 mailer bag and 1 card per order
  needs.push({ item: "Poly Mailer Bag", qty: 1 });
  needs.push({ item: "Thank-you Card", qty: 1 });

  return needs;
}

// Change an order's status.
// The first time an order leaves Pending (and is not cancelled), its materials are used up.
// Returns { ok, shortages, low }
function setOrderStatus(id, newStatus, reason) {
  const order = orders.find(function (o) { return o.id === id; });
  if (!order) return { ok: false, shortages: [], low: [] };

  const deducted = getDeducted();
  const low = [];

  if (newStatus !== "Pending" && newStatus !== "Cancelled" && !deducted[id]) {
    const needs = materialsNeeded(order);

    // Check there is enough of everything first
    const shortages = [];
    needs.forEach(function (n) {
      const mat = materials.find(function (x) { return x.item === n.item; });
      if (mat && mat.stock < n.qty) {
        shortages.push(n.item + " (need " + n.qty + ", have " + mat.stock + ")");
      }
    });
    if (shortages.length > 0) return { ok: false, shortages: shortages, low: [] };

    // Use up the materials
    needs.forEach(function (n) {
      const mat = materials.find(function (x) { return x.item === n.item; });
      if (!mat) return;
      const wasFine = mat.stock > mat.reorder;
      mat.stock -= n.qty;
      logStock(mat.item, -n.qty, "Used by " + id);
      if (wasFine && mat.stock <= mat.reorder) low.push(mat.item);
    });
    saveStock();

    deducted[id] = true;
    localStorage.setItem("stockDeducted", JSON.stringify(deducted));
  }

  // Save the new status and the date it happened
  order.status = newStatus;

  let overrides = {};
  try { overrides = JSON.parse(localStorage.getItem("statusOverrides")) || {}; } catch (e) {}
  overrides[id] = newStatus;
  localStorage.setItem("statusOverrides", JSON.stringify(overrides));

  const log = getStatusLog();
  if (!log[id]) log[id] = {};
  log[id][newStatus] = todayString();
  localStorage.setItem("statusLog", JSON.stringify(log));

  // Remember why an order was cancelled
  if (newStatus === "Cancelled") {
    const reasons = getCancelReasons();
    reasons[id] = reason || "Cancelled";
    localStorage.setItem("cancelReasons", JSON.stringify(reasons));
  }

  return { ok: true, shortages: [], low: low };
}

// ---------- Archive (keep records, hide finished orders) ----------
function getArchived() {
  try {
    return JSON.parse(localStorage.getItem("archivedOrders")) || {};
  } catch (e) {
    return {};
  }
}

function setArchived(id, value) {
  const archived = getArchived();
  if (value) archived[id] = true;
  else delete archived[id];
  localStorage.setItem("archivedOrders", JSON.stringify(archived));
}

// ---------- Stock safety ----------
// Storage limit for each material (6 times the reorder level)
function maxStock(m) {
  return m.reorder * 6;
}

// Recent stock activity (newest first, last 30 kept)
function getStockLog() {
  try {
    return JSON.parse(localStorage.getItem("stockLog")) || [];
  } catch (e) {
    return [];
  }
}

function logStock(item, change, note) {
  const log = getStockLog();
  log.unshift({
    date: todayString(),
    item: item,
    change: change,
    note: note
  });
  localStorage.setItem("stockLog", JSON.stringify(log.slice(0, 30)));
}

// ---------- Reset demo data ----------
// Clears everything the app saved in the browser and returns to the starting data
function resetDemoData() {
  [
    "newOrders", "statusOverrides", "statusLog", "archivedOrders",
    "stockLevels", "stockDeducted", "stockLog", "cancelReasons",
    "customers", "staffLockUntil"
  ].forEach(function (key) {
    localStorage.removeItem(key);
  });
}

// ---------- Dates and clock ----------
// Date as YYYY-MM-DD in the visitor's local time
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function todayString() {
  return toDateString(new Date());
}

// Date a number of days from today (negative = in the past)
function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

// Whole days from today to a date (negative = already passed)
function daysUntil(dateString) {
  const today = new Date(todayString() + "T00:00:00");
  const target = new Date(dateString + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function formatDate(dateString) {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  });
}

// Production time: bigger orders need more days
function leadDays(qty) {
  if (qty <= 20) return 5;
  if (qty <= 100) return 10;
  return 14;
}
const MAX_DAYS_AHEAD = 180;

// Live date and time
function startClock(el) {
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    });
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- Overdue and cancelled orders ----------
function getCancelReasons() {
  try {
    return JSON.parse(localStorage.getItem("cancelReasons")) || {};
  } catch (e) {
    return {};
  }
}

// Overdue = deadline passed and the order is still being made
function isOverdue(o) {
  return daysUntil(o.deadline) < 0 && ["Pending", "Printing", "Packed"].includes(o.status);
}

// Pending orders whose deadline passed were never started, so cancel them
function autoCancelExpired() {
  orders.forEach(function (o) {
    if (o.status === "Pending" && daysUntil(o.deadline) < 0) {
      setOrderStatus(o.id, "Cancelled", "Deadline passed before approval");
    }
  });
}
autoCancelExpired();