/* ===== layout.js: shared navbar and footer (role-based menu) ===== */

function renderLayout(activePage) {
  // Admin pages need the admin role, the rest need a customer
  const adminPages = ["dashboard", "orders", "materials"];
  const needed = adminPages.includes(activePage) ? "admin" : "customer";

  if (!requireLogin(needed)) return;
  const user = currentUser();

  const links = needed === "admin"
    ? [
        { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
        { key: "orders", label: "Orders", href: "orders.html" },
        { key: "materials", label: "Materials", href: "materials.html" }
      ]
    : [
        { key: "portal", label: "My Orders", href: "portal.html" },
        { key: "neworder", label: "New Order", href: "new-order.html" }
      ];

  const menuItems = links.map(function (l) {
    const active = l.key === activePage ? "active" : "";
    return '<li class="nav-item"><a class="nav-link ' + active + '" href="' + l.href + '">' + l.label + '</a></li>';
  }).join("");

  // Navbar
  document.getElementById("navbar").innerHTML =
    '<nav class="navbar navbar-expand-md navbar-dark app-nav">' +
      '<div class="container">' +
        '<a class="navbar-brand brand-nav" href="' + links[0].href + '">sekmung</a>' +
        '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Toggle navigation">' +
          '<span class="navbar-toggler-icon"></span>' +
        '</button>' +
        '<div class="collapse navbar-collapse" id="menu">' +
          '<ul class="navbar-nav me-auto">' + menuItems + '</ul>' +
          '<span class="nav-clock d-md-none d-lg-inline me-lg-3 my-2 my-md-0" id="navClock"></span>' +
          '<span class="user-chip me-md-3 my-2 my-md-0">' + escapeHtml(user.name) + ' &middot; ' + user.role + '</span>' +
          '<button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>' +
        '</div>' +
      '</div>' +
    '</nav>';

  // Live date and time
  startClock(document.getElementById("navClock"));

  // Footer
  document.getElementById("footer").innerHTML =
    '<footer class="app-footer">' +
      '<div class="container">' +
        '<div class="row gy-2">' +
          '<div class="col-md-6">' +
            '<strong>sekmung</strong>' +
            '<p class="mb-0 text-muted-custom">Custom merchandise order and materials manager.</p>' +
          '</div>' +
          '<div class="col-md-6 text-md-end text-muted-custom">' +
            '<p class="mb-0">&copy; 2026 sekmung admin. Concept project for IMS566.</p>' +
            '<p class="mb-0">Not an official sekmung system.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';
}