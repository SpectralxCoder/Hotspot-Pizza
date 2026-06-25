# Hot Spot Pizza — PRD (v3 — Feb 2026)

## Recent iteration: 21-item fix list shipped

### Customer experience
- ✅ User sign-in removed completely (UserAuth context, /auth pages deleted, login gate removed)
- ✅ Toast notifications moved to **bottom-center** with closeButton
- ✅ Free delivery banner on landing: "FREE within 3 km · Min order ₹200"
- ✅ Landing footer reads shop name, address, contact_number from Settings (live)
- ✅ Pure Veg badge in hero, menu, footer, featured cards
- ✅ Menu sort selector: Most Popular · Price Low→High · Price High→Low · Recommended
- ✅ Category pills horizontally scrollable + mouse-wheel scrollable + scroll-snap
- ✅ Menu items show "Unavailable" overlay + disabled "Unavailable" button when restaurant is closed
- ✅ Discount price renders with original crossed out (cart + menu)
- ✅ ETA: distance (Haversine) ÷ 32 kmph × 60 + 20 min prep → "Your order will be here in N mins"
- ✅ Delivery validates: min ₹200 order, max 3 km radius, address + pin on map required
- ✅ Mode locking (QR-driven) + table number readOnly when scanned; URL-tampered tables redirect home
- ✅ Confirmation/Tracker shows "Accepted" / "Rejected (with reason)"

### Admin
- ✅ Mobile nav drawer with hamburger trigger on admin pages
- ✅ Back button → returns to landing (`/`), not browser history
- ✅ Dashboard: "Hello, {Admin Name}" greeting (uses `admin_display_name`)
- ✅ Dashboard time-range filter: Today / Week / Month / 3M / 6M / Year / All-time — all stats update
- ✅ New order flow: Accepted → Preparing → Out For Delivery → Delivered (auto-archives on Delivered)
- ✅ "Mark Done" removed; archive happens automatically when status hits "Delivered"
- ✅ Reject order button + rejection reason dialog
- ✅ Menu Manager:
  - "Sort order" renamed to **Display Position**
  - Old JSON sizes field replaced by friendly multi-line input: `Size: small, Price: 200`
  - Discount price field added (shows Sale badge + crossed-out original)
  - Multi-select with bulk: mark available/unavailable, ± price %, delete
- ✅ Categories CRUD page (`/admin/categories`) — add, rename, reorder, delete (only if empty)
- ✅ QR Codes: dynamic from `num_tables` (1–N), per-QR Print button, Print All
- ✅ Settings overhaul:
  - Shop name (read-only)
  - Address (textarea) + GPS lat/lng + "Use my GPS" + map picker
  - Contact number editable
  - Number of tables editable
  - Opening hours with validation (start ≠ end)
  - "Open · click to close" toggle works both ways
  - All saves emit success/error toasts
- ✅ Order Archive → renamed to "Order History"
- ✅ Realtime subscriptions resilient (no more `[object Object]` errors)

### Schema updates required
**Apply `/app/database/schema_v3.sql`** in Supabase SQL Editor:
- Extends `restaurant_settings`: shop_name, address, shop_lat/lng, contact_number, num_tables, min_order_amount, delivery_radius_km, admin_display_name
- New table: `categories`
- `menu_items`: adds `discount_price`
- `orders`: status check now includes Accepted/Preparing/Out For Delivery/Delivered/Rejected; new `rejection_reason` column
- Seeds 11 default categories

### File map (new/major)
- New: `lib/hours.js` (ETA + restaurant location + free delivery constants)
- New: `contexts/SettingsContext.jsx` (single source of truth for settings + categories)
- New: `pages/AdminCategories.jsx`
- Rebuilt: `AdminSettings.jsx`, `AdminMenuManager.jsx`, `AdminOrders.jsx`, `AdminDashboard.jsx`, `AdminLayout.jsx` (mobile drawer), `AdminQRCodes.jsx`, `Checkout.jsx`, `Menu.jsx`, `MenuItemCard.jsx`, `Landing.jsx`, `Footer.jsx`, `Navbar.jsx`, `OrderTracker.jsx`, `Confirmation.jsx`, `lib/menuService.js`, `lib/orders.js`
- Deleted: `UserAuthContext.jsx`, `UserLogin.jsx`, `AuthCallback.jsx`, `AdminSidebar.jsx` (folded into AdminLayout)

### Backlog
- P1: KDS responsive layout for tablet
- P1: Toast actions ("Undo" archive on accidental delivery)
- P2: Daily revenue chart on dashboard
- P2: Pagination on Order History
