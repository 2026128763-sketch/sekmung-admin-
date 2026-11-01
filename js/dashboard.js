/* ===== dashboard.js: summary cards, charts, urgent list ===== */

// Cancelled orders do not count as sales
const liveOrders = orders.filter(function (o) { return o.status !== "Cancelled"; });

// ---------- Summary cards ----------
const totalRevenue = liveOrders.reduce(function (sum, o) { return sum + o.price; }, 0);
const printingCount = orders.filter(function (o) { return o.status === "Printing"; }).length;
const lowStockCount = materials.filter(function (m) { return m.stock <= m.reorder; }).length;

document.getElementById("statOrders").textContent = liveOrders.length;
document.getElementById("statPrinting").textContent = printingCount;
document.getElementById("statRevenue").textContent = "RM " + totalRevenue.toLocaleString();
document.getElementById("statLow").textContent = lowStockCount;

// ---------- Chart defaults (dark theme) ----------
Chart.defaults.color = "#9aa0ae";
Chart.defaults.font.family = "Inter, sans-serif";
Chart.defaults.borderColor = "#232733";

// ---------- Chart 1: orders by status (doughnut) ----------
const chartLabels = statusList.concat(["Cancelled"]);
const statusCounts = chartLabels.map(function (s) {
  return orders.filter(function (o) { return o.status === s; }).length;
});

new Chart(document.getElementById("statusChart"), {
  type: "doughnut",
  data: {
    labels: chartLabels,
    datasets: [{
      data: statusCounts,
      backgroundColor: ["#6b7080", "#f5a84b", "#5aa9f0", "#b48af0", "#4cc38a", "#f06a6a"],
      borderColor: "#12151c",
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: { legend: { position: "bottom" } }
  }
});

// ---------- Chart 2: revenue by product type (bar) ----------
const productTypes = [...new Set(liveOrders.map(function (o) { return o.product; }))];
const revenueByProduct = productTypes.map(function (p) {
  return liveOrders
    .filter(function (o) { return o.product === p; })
    .reduce(function (sum, o) { return sum + o.price; }, 0);
});

new Chart(document.getElementById("productChart"), {
  type: "bar",
  data: {
    labels: productTypes,
    datasets: [{
      label: "Revenue (RM)",
      data: revenueByProduct,
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } }
    }
  }
});

// ---------- Needs attention list ----------
// Orders still being made, closest deadline first (overdue ones come first)
const openOrders = orders
  .filter(function (o) { return ["Pending", "Printing", "Packed"].includes(o.status); })
  .sort(function (a, b) { return daysUntil(a.deadline) - daysUntil(b.deadline); })
  .slice(0, 5);

document.getElementById("attentionList").innerHTML = openOrders.length === 0
  ? '<p class="text-muted-custom small mb-0">Nothing needs attention right now.</p>'
  : openOrders.map(function (o) {
      const days = daysUntil(o.deadline);

      let label, cls;
      if (days < 0) { label = "Overdue by " + Math.abs(days) + " day(s)"; cls = "urgent-red"; }
      else if (days === 0) { label = "Due today"; cls = "urgent-red"; }
      else if (days <= 3) { label = "Due in " + days + " day(s)"; cls = "urgent-red"; }
      else if (days <= 7) { label = "Due in " + days + " day(s)"; cls = "urgent-orange"; }
      else { label = "Due in " + days + " day(s)"; cls = "urgent-green"; }

      return '<div class="attention-row">' +
        '<div><strong>' + o.id + '</strong> <span class="text-muted-custom">' + escapeHtml(o.customer) + ' &middot; ' + o.product + '</span></div>' +
        '<span class="status-badge ' + cls + '">' + label + '</span>' +
        '</div>';
    }).join("");

// ---------- Orders waiting for approval ----------
const pendingCount = orders.filter(function (o) { return o.status === "Pending"; }).length;

if (pendingCount > 0) {
  const notice = document.getElementById("pendingNotice");
  notice.innerHTML =
    '<span><strong>' + pendingCount + '</strong> order' + (pendingCount > 1 ? 's are' : ' is') + ' waiting for your approval.</span>' +
    '<a href="orders.html" class="btn btn-light btn-sm">Review orders</a>';
  notice.classList.remove("d-none");
}

// ---------- Reset demo data ----------
document.getElementById("resetDemo").addEventListener("click", function () {
  if (confirm("Reset all demo data? New orders, status changes, stock changes, archives and registered customers will be removed.")) {
    resetDemoData();
    window.location.reload();
  }
});