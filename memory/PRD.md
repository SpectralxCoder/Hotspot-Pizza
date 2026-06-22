# Hot Spot Pizza — PRD (v2 update Feb 2026)

## Current Iteration: User auth, admin menu CRUD, settings & ETA

### What's new in v2 (just shipped)
- **User Authentication** (Supabase Auth)
  - Google sign-in (OAuth via Supabase)
  - Phone OTP login (Supabase Phone Auth → Twilio)
  - `/auth/login` page with both options; `/auth/callback` for OAuth return
  - Login required before placing an order
- **QR-aware mode locking**
  - `?table=N` → only Dine-in available; table field is locked + read-only
  - `?mode=delivery` → only Home Delivery available
  - Both branches share same `/menu` and `/checkout` routes; UX adapts
- **Table number validation**
  - Max 20 (configurable via constant `MAX_TABLES`)
  - Read-only when entered via QR
- **Location picker (Leaflet + OpenStreetMap)**
  - Map shown for delivery only
  - "Use my location" button (browser geolocation)
  - Drag-to-pin or click-to-pin
  - Reverse geocode via Nominatim (no API key)
- **ETA calculator**
  - Hidden for dine-in
  - For delivery: 15 + (qty × 2) + (distance_km × 3) → capped 20–60 min
- **Admin Menu Manager** (`/admin/menu`)
  - CRUD on items (name, description, category, price OR pizza sizes JSON, image, sort order)
  - Image upload to Supabase Storage bucket `menu-images`
  - Toggle "In stock" / "Out of stock"
  - Toggle "Most popular" (manual override)
  - "Seed default menu" button (idempotent — only fills if empty)
- **Admin Settings** (`/admin/settings`)
  - Open/Closed toggle (manual restaurant override)
  - Editable opening hours (default Mon–Sun · 11:45 AM – 11:00 PM)
  - Choose popular-mode: All-time vs Last 30 days
- **Most-popular auto-calculation**
  - Aggregates `order_items` + `archived_orders.order_data` per chosen window
  - Top 5 items highlighted on customer menu with a "Most Popular" badge
- **Confirm dialog component**
  - Replaces all `window.confirm()` calls (admin orders archive)
  - Toast notifications already in use everywhere — added `closeButton` prop
- **Back button** in admin sidebar
- **Out-of-stock state** on customer menu cards (overlay + disabled Add button)
- **Restaurant-closed banner** on menu + checkout when outside hours OR admin toggled closed

### Required setup (user action)
1. **Apply schema v2**: `/app/database/schema_v2.sql` in Supabase SQL Editor
2. **Enable Google provider** in Supabase: Dashboard → Authentication → Providers → Google
   - Add redirect URL: `https://pizza-order-hub-44.preview.emergentagent.com/auth/callback`
   - You'll need a Google Cloud OAuth client ID + secret pasted into Supabase
3. **Enable Phone provider** in Supabase: Dashboard → Authentication → Providers → Phone
   - Add Twilio Account SID, Auth Token, Message Service SID OR Verify Service SID
4. **Storage bucket** `menu-images` is created automatically by schema_v2.sql with public read + insert

### Backend (unchanged)
- FastAPI JWT admin (`/api/admin/login`, `/api/admin/verify`) — `hotspotadmin` / `pizza@123`

### File map
- New: `/app/database/schema_v2.sql`
- New: `/app/frontend/src/contexts/UserAuthContext.jsx`, `ConfirmContext.jsx`
- New: `/app/frontend/src/pages/UserLogin.jsx`, `AuthCallback.jsx`, `AdminMenuManager.jsx`, `AdminSettings.jsx`
- New: `/app/frontend/src/components/MapPicker.jsx`
- New: `/app/frontend/src/lib/menuService.js`, `hours.js`, `seed.js`
- Updated: `Menu.jsx` (reads from Supabase, popular badges, mode badge, closed banner)
- Updated: `Checkout.jsx` (auth gate, mode lock, map, ETA, table cap)
- Updated: `MenuItemCard.jsx` (out-of-stock + popular badge)
- Updated: `AdminSidebar.jsx` (new links + Back button)
- Updated: `AdminOrders.jsx` (custom confirm dialog)
- Updated: `App.js` (new routes + UserAuthProvider + ConfirmProvider)

### Backlog
- P1: Customer "My Orders" page (history list via `user_id`)
- P1: Admin restaurant location setter (map) — affects ETA distance baseline
- P1: Auto-fill delivery address fields from reverse geocode
- P2: WhatsApp/SMS status notifications via Twilio
- P2: PWA install
