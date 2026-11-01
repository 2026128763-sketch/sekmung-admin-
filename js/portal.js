/* ===== portal.js: customer's own orders ===== */

const user = currentUser();
const ACTIVE = ["Pending", "Printing", "Packed"];

function render() {
  const reasons = getCancelReasons();

  // Only this customer's orders; cancelled ones don't count as spending
  const mine = orders.filter(function (o) { return o.customer === user.name; });
  const counted = mine.filter(function (o) { return o.status !== "Cancelled"; });

  // ---------- Summary cards ----------
  const delivered = counted.filter(function (o) { return o.status === "Delivered"; }).length;
  const spent = counted.reduce(function (sum, o) { return sum + o.price; }, 0);

  document.getElementById("statTotal").textContent = mine.length;
  document.getElementById("statProgress").textContent = counted.length - delivered;
  document.getElementById("statDelivered").textContent = delivered;
  document.getElementById("statSpent").textContent = "RM " + spent.toLocaleString();

  // ---------- Current order card ----------
  const latestCard = document.getElementById("latestCard");

  if (mine.length === 0) {
    latestCard.classList.add("d-none");
  } else {
    latestCard.classList.remove("d-none");

    // Newest open order, or the newest order that was not cancelled
    const open = mine.filter(function (o) { return o.status !== "Delivered" && o.status !== "Cancelled"; });
    const f = open.length
      ? open[open.length - 1]
      : (counted.length ? counted[counted.length - 1] : mine[mine.length - 1]);

    let tracker;
    if (f.status === "Cancelled") {
      tracker = '<p class="text-overdue mb-0 mt-3">This order was cancelled' +
        (reasons[f.id] ? ": " + escapeHtml(reasons[f.id]) : "") + '.</p>';
    } else {
      const position = statusList.indexOf(f.status);
      const log = getStatusLog()[f.id] || {};

      const steps = statusList.map(function (s, i) {
        const cls = i < position ? "done" : (i === position ? "current" : "");
        // Show the date a step was reached (only for steps already reached)
        const date = i <= position ? (log[s] || (s === "Pending" ? f.created : "")) : "";
        const dateText = date
          ? '<small>' + new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + '</small>'
          : "";
        return '<li class="' + cls + '">' + s + dateText + '</li>';
      }).join("");

      tracker = '<ol class="steps">' + steps + '</ol>';
    }

    const dueNote = isOverdue(f) ? ' <span class="text-overdue">Overdue</span>' : "";

    latestCard.innerHTML =
      '<div class="featured">' +
        '<div class="featured-img">' + productSvg(f.product, f.color, f.design) + '</div>' +
        '<div class="featured-body">' +
          '<p class="stat-label mb-1">' + (open.length && f.status !== "Cancelled" ? "Current order" : "Latest order") + '</p>' +
          '<h2 class="featured-title">' + f.product + ' &middot; ' + (f.color || "Black") + '</h2>' +
          '<p class="text-muted-custom mb-2">' + escapeHtml(f.design) + ' &middot; ' + f.id + ' &middot; Qty ' + f.qty + '</p>' +
          '<span class="status-badge status-' + f.status.toLowerCase() + '">' + f.status + '</span>' +
          '<span class="text-muted-custom small ms-2">Needed by ' + f.deadline + '</span>' + dueNote +
          tracker +
        '</div>' +
      '</div>';
  }

  // ---------- Orders table ----------
  const body = document.getElementById("myOrdersBody");

  if (mine.length === 0) {
    body.innerHTML = '<tr><td colspan="10" class="text-center text-muted-custom py-4">You have no orders yet. Place your first order.</td></tr>';
    return;
  }

  body.innerHTML = mine.map(function (o) {
    const cancelled = o.status === "Cancelled";
    const percent = ((statusList.indexOf(o.status) + 1) / statusList.length) * 100;

    const progress = cancelled
      ? '<span class="text-muted-custom small">&mdash;</span>'
      : '<div class="progress progress-thin"><div class="progress-bar" style="width:' + percent + '%"></div></div>';

    const reason = cancelled && reasons[o.id]
      ? '<small class="text-muted-custom d-block">' + escapeHtml(reasons[o.id]) + '</small>'
      : "";
    const overdue = isOverdue(o) ? '<small class="text-overdue d-block">Overdue</small>' : "";

    // Customers can only cancel an order that is still Pending
    const action = o.status === "Pending"
      ? '<button type="button" class="btn btn-outline-danger btn-sm" data-cancel="' + o.id + '">Cancel</button>'
      : "";

    return '<tr>' +
      '<td>' + o.id + '</td>' +
      '<td><div class="d-flex align-items-center gap-2"><div class="thumb">' + productSvg(o.product, o.color, "") + '</div><span>' + o.product + '</span></div></td>' +
      '<td>' + escapeHtml(o.design) + '</td>' +
      '<td>' + o.size + '</td>' +
      '<td>' + o.qty + '</td>' +
      '<td>' + o.deadline + overdue + '</td>' +
      '<td>RM ' + o.price.toFixed(2) + '</td>' +
      '<td><span class="status-badge status-' + o.status.toLowerCase() + '">' + o.status + '</span>' + reason + '</td>' +
      '<td style="min-width:120px">' + progress + '</td>' +
      '<td>' + action + '</td>' +
      '</tr>';
  }).join("");
}

if (user) {
  document.getElementById("welcome").textContent = "Hi, " + user.name;

  // Cancel button (only for the customer's own Pending orders)
  document.getElementById("myOrdersBody").addEventListener("click", function (e) {
    const id = e.target.dataset.cancel;
    if (!id) return;

    const order = orders.find(function (o) { return o.id === id; });
    if (!order || order.customer !== user.name || order.status !== "Pending") return;

    if (confirm("Cancel order " + id + "? This cannot be undone.")) {
      setOrderStatus(id, "Cancelled", "Cancelled by customer");
      render();
    }
  });

  render();
}