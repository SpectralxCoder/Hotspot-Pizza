# Hot Spot Pizza — PRD

## Original Problem Statement
Build a full-stack modern pizza ordering website for "Hot Spot Pizza" — a pizza cafe brand. Premium light theme (whites, soft creams, warm reds). Customer ordering with QR-table-aware menu, cart, checkout (dine-in/delivery), order confirmation and live tracking. Admin dashboard with stats, active orders management, archive, QR code manager. Kitchen Display System. Real-time updates via Supabase Realtime. Pay on delivery only.

## Architecture
- **Frontend**: React (CRA) + React Router + Tailwind + Shadcn/UI primitives + `@supabase/supabase-js` (direct DB + realtime) + `qrcode.react`
- **Backend (FastAPI)**: Admin JWT auth (custom, bcrypt-hashed) — `/api/admin/login`, `/api/admin/verify`; admin seeded on startup from env vars
- **Database**: Supabase Postgres (tables: `orders`, `order_items`, `archived_orders`) — schema in `/app/database/schema.sql`
- **Auth**: Admin login is custom JWT (FastAPI). Customer flow has no auth.

## User Personas
1. **Customer (dine-in)** — Scans table QR → browses menu → adds items → checkout (name + auto-filled table) → tracks live status
2. **Customer (delivery)** — Scans delivery QR (or visits site) → orders → checkout with phone + address → tracks live status
3. **Admin/Owner** — Logs into `/admin` → views dashboard, manages orders, archives, prints table QR codes
4. **Kitchen Staff** — Opens `/admin/kitchen` → simple ticket display, start/ready buttons

## Core Requirements (Static)
- Light theme only; brand palette: cream (#FFFDF9), red (#E63946), orange (#F4A261), beige border (#F0E6DA)
- Fonts: Playfair Display (headings) + Poppins (body) via Google Fonts
- Real-time sync between customer tracker, admin orders, and KDS
- QR per table 1–20 + Home Delivery (printable)
- Pizza size selector (R/M/L) before adding to cart
- Pay on Delivery only

## v1 Implemented (2026-02)
- ✅ Light-theme landing with hero, featured slices, brand tagline
- ✅ Tabbed menu with search & smooth-scroll category nav, 11 categories, 40+ items
- ✅ Pizza size dialog (Regular/Medium/Large)
- ✅ Floating cart with slide-in drawer + +/- quantity + persistent storage
- ✅ Checkout flow with Dine-in/Delivery toggle (auto-filled when arriving via `?table=N` or `?mode=delivery`)
- ✅ Order confirmation with live tracker (Received → Preparing → Ready → Delivered)
- ✅ Customer order tracking page (subscribed to Supabase realtime)
- ✅ Admin JWT login (FastAPI) with seeded admin
- ✅ Admin Dashboard (active orders, today's count, revenue, AOV, top items)
- ✅ Active Orders management with status dropdown + Mark Done → Archive
- ✅ Archive with search/date filter
- ✅ QR Code Manager (Tables 1–20 + Home Delivery, printable A4-friendly)
- ✅ Kitchen Display System with color-coded tickets + Start/Ready actions
- ✅ Supabase realtime via `postgres_changes` channels for orders & archive
- ✅ Toast notifications (sonner) with cream/border styling
- ✅ Responsive across mobile / tablet / desktop
- ✅ data-testid attributes throughout for QA

## Prioritized Backlog
### P0 — User setup (one-time)
- Apply `/app/database/schema.sql` in Supabase SQL Editor

### P1
- Optional add-ons (Extra cheese / paneer / jalapeno) — architecture already supports via `size`+`name` composition; UI not yet built
- "Done → auto-archive after 6h" cron (currently archives immediately on Mark Done)
- Order receipt PDF download
- Customer phone-based order history lookup

### P2
- PWA support (manifest, offline shell)
- WhatsApp / SMS notifications on status change (Twilio integration)
- Promo code / coupon support
- Reviews / ratings collection after delivery

## File Map
- Backend: `/app/backend/server.py`
- Frontend pages: `/app/frontend/src/pages/`
- Frontend components: `/app/frontend/src/components/`
- Supabase SQL: `/app/database/schema.sql`
- Cart state: `/app/frontend/src/contexts/CartContext.jsx`
- Admin auth state: `/app/frontend/src/contexts/AuthContext.jsx`
- Supabase client + helpers: `/app/frontend/src/lib/supabase.js` + `/app/frontend/src/lib/orders.js`

## Required Setup Steps (READ ME)
1. Open Supabase Dashboard → SQL Editor → **New query** → paste contents of `/app/database/schema.sql` → Run.
2. Verify tables `orders`, `order_items`, `archived_orders` exist under `public` schema.
3. (Optional) Verify Realtime is enabled for those tables in Database → Replication.
4. Open the live preview URL and test:
   - Customer: `/menu?table=5` (dine-in) or `/menu?mode=delivery` (delivery)
   - Admin: `/admin/login` with `hotspotadmin` / `pizza@123`
