/* ===== orders.js: orders table, filters, approve, cancel and archive ===== */

const tbody = document.getElementById("ordersBody");
const searchBox = document.getElementById("searchBox");
const statusFilter = document.getElementById("statusFilter");
const archivedToggle = document.getElementById("showArchived");
const resultCount = document.getElementById("resultCount");
const toast = document.getElementById("statusToast");

// Orders that are still being made
const ACTIVE = ["Pending", "Printing", "Packed"];

// Fill the status dropdown (Cancelled is a separate status)
statusList.concat(["Cancelled"]).forEach(function (s) {
  statusFilter.innerHTML += '<option value="' + s + '">' + s + '</option>';
});

// Deadline cell with an overdue or due-soon note
function deadlineCell(o) {
  let note = "";
  const d = daysUntil(o.deadline);

  if (isOverdue(o)) {
    note = '<small class="text-overdue d-block">Overdue by ' + Math.abs(d) + ' day(s)</small>';
  } else if (ACTIVE.includes(o.status) && d <= 3) {
    note = '<small class="text-overdue d-block">' + (d === 0 ? "Due today" : "Due in " + d + " day(s)") + '</small>';
  }
  return '<td>' + o.deadline + note + '</td>';
}

// Show the orders that match the search text, status and archive setting
function renderOrders() {
  const text = searchBox.value.toLowerCase().trim();
  const status = statusFilter.value;
  const archived = getArchived();
  const reasons = getCancelReasons();
  const showArchived = archivedToggle.checked;

  const filtered = orders.filter(function (o) {
    const matchText =
      o.id.toLowerCase().includes(text) ||
      o.customer.toLowerCase().includes(text) ||
      o.design.toLowerCase().includes(text);
    const matchStatus = status === "All" || o.status === status;
    const matchArchive = showArchived || !archived[o.id];
    return matchText && matchStatus && matchArchive;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted-custom py-4">No orders found.</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(function (o) {
      const isArchived = archived[o.id];
      let actions = "";

      if (isArchived) {
        // Archived orders can only be restored
        actions = '<button type="button" class="btn btn-outline-light btn-sm" data-restore="' + o.id + '">Restore</button>';
      } else {
        if (o.status === "Pending") {
          actions += '<button type="button" class="btn btn-light btn-sm me-2" data-approve="' + o.id + '">Approve</button>';
        }
        if (ACTIVE.includes(o.status)) {
          actions += '<button type="button" class="btn btn-outline-danger btn-sm me-2" data-cancel="' + o.id + '">Cancel</button>';
        }
        if (o.status === "Delivered" || o.status === "Cancelled") {
          actions += '<button type="button" class="btn btn-outline-light btn-sm me-2" data-archive="' + o.id + '">Archive</button>';
        }
        // Dropdown to set a production status (not for cancelled orders)
        if (o.status !== "Cancelled") {
          const options = statusList.map(function (s) {
            return '<option value="' + s + '"' + (s === o.status ? " selected" : "") + '>' + s + '</option>';
          }).join("");
          actions += '<select class="form-select form-select-sm status-select" data-id="' + o.id + '">' + options + '</select>';
        }
      }

      // Show why an order was cancelled
      const reason = o.status === "Cancelled" && reasons[o.id]
        ? '<small class="text-muted-custom d-block">' + escapeHtml(reasons[o.id]) + '</small>'
        : "";

      return '<tr class="' + (isArchived ? "row-archived" : "") + '">' +
        '<td>' + o.id + '</td>' +
        '<td>' + escapeHtml(o.customer) + '</td>' +
        '<td>' + o.product + '</td>' +
        '<td>' + escapeHtml(o.design) + '</td>' +
        '<td>' + o.size + '</td>' +
        '<td>' + o.qty + '</td>' +
        deadlineCell(o) +
        '<td>RM ' + o.price.toFixed(2) + '</td>' +
        '<td><span class="status-badge status-' + o.status.toLowerCase() + '">' + o.status + '</span>' + reason + '</td>' +
        '<td class="text-nowrap">' + actions + '</td>' +
        '</tr>';
    }).join("");
  }

  // Count line, with a note about hidden archived orders
  const hidden = showArchived ? 0 : orders.filter(function (o) { return archived[o.id]; }).length;
  resultCount.textContent = "Showing " + filtered.length + " of " + orders.length + " orders" +
    (hidden > 0 ? " (" + hidden + " archived hidden)" : "");
}

// Save a new status, refresh the table and show a message
function updateStatus(id, status, message, reason) {
  const result = setOrderStatus(id, status, reason);
  renderOrders();

  // Not enough stock: nothing changed
  if (!result.ok) {
    showToast("Not enough stock: " + result.shortages.join(", ") + ". Restock on the Materials page.");
    return;
  }

  if (result.low.length > 0) {
    message += ". Now low on: " + result.low.join(", ");
  }
  showToast(message);
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("d-none");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.add("d-none"); }, 4500);
}

// Approve, cancel, archive and restore buttons
tbody.addEventListener("click", function (e) {
  const d = e.target.dataset;

  if (d.approve) {
    updateStatus(d.approve, "Printing", d.approve + " approved and moved to Printing");
  }

  if (d.cancel) {
    const order = orders.find(function (o) { return o.id === d.cancel; });
    if (!order) return;
    if (!confirm("Cancel order " + order.id + "? This cannot be undone.")) return;

    const reason = isOverdue(order) ? "Deadline passed" : "Cancelled by staff";
    let message = order.id + " cancelled";
    if (getDeducted()[order.id]) message += ". Materials already used were not returned";
    updateStatus(order.id, "Cancelled", message, reason);
  }

  if (d.archive) {
    setArchived(d.archive, true);
    renderOrders();
    showToast(d.archive + " archived. It still counts in your sales reports.");
  }
  if (d.restore) {
    setArchived(d.restore, false);
    renderOrders();
    showToast(d.restore + " restored to the active list.");
  }
});

// Status dropdown
tbody.addEventListener("change", function (e) {
  if (e.target.classList.contains("status-select")) {
    updateStatus(e.target.dataset.id, e.target.value, e.target.dataset.id + " is now " + e.target.value);
  }
});

searchBox.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);
archivedToggle.addEventListener("change", renderOrders);

renderOrders();