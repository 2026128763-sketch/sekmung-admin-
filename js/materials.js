/* ===== materials.js: materials table, restock, correction and stock activity ===== */

const tbody = document.getElementById("materialsBody");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const resultCount = document.getElementById("resultCount");
const toast = document.getElementById("stockToast");
const logBox = document.getElementById("stockLogList");

// Build the category dropdown from the data (no duplicates)
const categories = [...new Set(materials.map(function (m) { return m.category; }))];
categories.forEach(function (c) {
  categoryFilter.innerHTML += '<option value="' + c + '">' + c + '</option>';
});

function renderMaterials() {
  const text = searchBox.value.toLowerCase().trim();
  const category = categoryFilter.value;

  const filtered = materials.filter(function (m) {
    const matchText =
      m.item.toLowerCase().includes(text) ||
      m.supplier.toLowerCase().includes(text);
    const matchCategory = category === "All" || m.category === category;
    return matchText && matchCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted-custom py-4">No materials found.</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(function (m) {
      const index = materials.indexOf(m);
      const max = maxStock(m);

      // Low stock when stock is at or below the reorder level
      const isLow = m.stock <= m.reorder;
      const badge = isLow
        ? '<span class="status-badge status-low">Low stock</span>'
        : '<span class="status-badge status-ok">In stock</span>';

      // Bar shows how full the storage limit is
      const percent = Math.min(100, Math.round((m.stock / max) * 100));

      return '<tr>' +
        '<td>' + m.item + '</td>' +
        '<td>' + m.category + '</td>' +
        '<td>' + m.supplier + '</td>' +
        '<td>' + m.stock + ' <span class="text-muted-custom small">/ ' + max + '</span>' +
          '<div class="stock-bar ' + (isLow ? "low" : "") + '"><span style="width:' + percent + '%"></span></div></td>' +
        '<td>' + m.reorder + '</td>' +
        '<td>RM ' + m.unitCost.toFixed(2) + '</td>' +
        '<td>' + badge + '</td>' +
        '<td><div class="restock">' +
          '<input type="number" min="1" value="10" class="form-control form-control-sm restock-qty" id="qty-' + index + '">' +
          '<button type="button" class="btn btn-light btn-sm" data-restock="' + index + '">Add</button>' +
          '<button type="button" class="btn btn-outline-light btn-sm" data-remove="' + index + '">Remove</button>' +
        '</div></td>' +
        '</tr>';
    }).join("");
  }

  resultCount.textContent = "Showing " + filtered.length + " of " + materials.length + " items";
  renderLog();
}

// Recent stock activity list
function renderLog() {
  const log = getStockLog().slice(0, 8);

  if (log.length === 0) {
    logBox.innerHTML = '<p class="text-muted-custom small mb-0">No activity yet. Restocks, corrections and materials used by orders will appear here.</p>';
    return;
  }

  logBox.innerHTML = log.map(function (e) {
    const cls = e.change > 0 ? "urgent-green" : "urgent-red";
    const sign = e.change > 0 ? "+" : "";
    return '<div class="attention-row">' +
      '<div><strong>' + escapeHtml(e.item) + '</strong> <span class="text-muted-custom">' + escapeHtml(e.note) + '</span></div>' +
      '<span class="status-badge ' + cls + '">' + sign + e.change + ' &middot; ' + e.date + '</span>' +
      '</div>';
  }).join("");
}

// Add and Remove buttons
tbody.addEventListener("click", function (e) {
  const d = e.target.dataset;
  const isAdd = d.restock !== undefined;
  const isRemove = d.remove !== undefined;
  if (!isAdd && !isRemove) return;

  const index = Number(isAdd ? d.restock : d.remove);
  const qty = parseInt(document.getElementById("qty-" + index).value);
  const m = materials[index];

  if (!qty || qty < 1) {
    showToast("Enter a quantity of 1 or more.");
    return;
  }

  if (isAdd) {
    // Stop the stock from going over the storage limit
    const room = maxStock(m) - m.stock;
    if (qty > room) {
      showToast("Over capacity. The limit for " + m.item + " is " + maxStock(m) + ", so you can add up to " + room + ".");
      return;
    }
    m.stock += qty;
    saveStock();
    logStock(m.item, qty, "Restock");
    showToast("Added " + qty + " to " + m.item + ". Stock is now " + m.stock + ".");
  } else {
    // Correction: can't remove more than what is in stock
    if (qty > m.stock) {
      showToast("You can't remove more than the current stock (" + m.stock + ").");
      return;
    }
    const reason = prompt("Reason for removing " + qty + " from " + m.item + "?", "Counting error");
    if (reason === null) return; // cancelled
    m.stock -= qty;
    saveStock();
    logStock(m.item, -qty, "Correction: " + (reason.trim() || "no reason given"));
    showToast("Removed " + qty + " from " + m.item + ". Stock is now " + m.stock + ".");
  }

  renderMaterials();
});

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("d-none");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.add("d-none"); }, 4500);
}

searchBox.addEventListener("input", renderMaterials);
categoryFilter.addEventListener("change", renderMaterials);

renderMaterials();