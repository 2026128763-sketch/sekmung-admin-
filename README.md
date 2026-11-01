# sekmung admin

A front-end web application prototype for a custom merchandise business, built for the IMS566 Advanced Web Design Development and Content Management individual assignment. It has two sides: a **staff side** to manage orders, materials and stock, and a **customer side** to design, place and track orders.

> Concept project for IMS566. Not an official sekmung system. All data is fictional.

## Live Website
https://YOUR-USERNAME.github.io/sekmung-admin/

## Repository
https://github.com/YOUR-USERNAME/sekmung-admin

## How to Test the Login
Open the live link, then choose a door on the landing page.

**Staff**
- Click "Staff"
- Username: `admin`
- PIN: `2026` (tap it on the on-screen keypad)

**Customer**
- Click "Customer", then "Log in"
- Email: `aiman@example.com`
- Password: `user123`

You can also create a new customer account with the Register tab.

**Please test both roles in the same browser.** Accounts, orders, status changes and stock levels are saved in the browser (localStorage), so the staff side and the customer side see the same data. Staff can use "Reset demo data" at the bottom of the Dashboard to return to the starting data. Please do not change the demo customer's password, or reset it afterwards. Login is simulated for this prototype and is not real security.

## Features
**Landing page and login system**
- Landing page with a hero section, floating product collage, live date and time, and two entrances: Customer and Staff
- Staff login with a username and an on-screen PIN pad (wrong PIN shakes, keypad locks for 30 seconds after 3 failed attempts)
- Customer login and registration with validation, show/hide password and a password strength meter
- Forgot password: a 6-digit code (shown in a demo inbox because a front-end prototype cannot send emails), expiry after 5 minutes, 3 tries, and the new password must differ from the old one
- Role-based access: each role can only open its own pages. The menu differs by role (staff: Dashboard, Orders, Materials; customer: My Orders, New Order)

**Staff side**
- Dashboard with summary cards, an orders-by-status doughnut chart, a revenue-by-product bar chart, a "Needs attention" list sorted by deadline, and a notice for orders waiting for approval
- Orders page: table, search, status filter, Approve, Cancel, Archive and Restore, a status dropdown, and overdue warnings
- Orders whose deadline passed before approval are cancelled automatically; orders in production that pass their deadline are flagged Overdue
- Materials page: table, search, category filter, low-stock warnings, stock bars, Add and Remove (with a reason) controls, a storage limit to prevent over-stocking, and a recent stock activity list
- Approving an order uses up the materials it needs, and is blocked if there is not enough stock
- Finished orders can be archived instead of deleted, so sales records are kept

**Customer side**
- My Orders: summary cards, a current-order card with a picture and a step tracker (with dates), and a table of all orders. Customers can cancel an order while it is still Pending
- New Order: choose a product, colour, size and quantity, with a live product preview and price estimate. Deadline rules stop illogical dates (past dates, dates that are too soon for the quantity, or too far ahead)

**General**
- Responsive layout (desktop and mobile), a navbar that collapses on small screens, a professional footer, titles and metadata on every page
- Dark minimal design

## Frameworks and Libraries Used
- Bootstrap 5.3 (layout, navbar, tables, forms)
- Chart.js 4 (doughnut and bar charts)
- Google Fonts (Inter)
- Vanilla JavaScript, HTML5 and CSS3

## Project Structure
- index.html: landing page and login (customer and staff)
- dashboard.html, orders.html, materials.html: staff pages
- portal.html, new-order.html: customer pages
- css/style.css: all styles
- js/auth.js: accounts and session
- js/data.js: demo data, stock rules, dates and clock
- js/layout.js: shared navbar and footer
- js/mockup.js: product pictures (SVG)
- js/login.js, dashboard.js, orders.js, materials.js, portal.js, new-order.js: page scripts

## Author
MUHAMMAD AMAR DANIAL BIN NAZAR (2026128763), UiTM Machang, IMS566