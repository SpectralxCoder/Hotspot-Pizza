// Restaurant hours: Mon-Sun 11:45 AM - 11:00 PM
// Plus admin can manually close via restaurant_settings.is_open

export function isWithinHours(settings) {
    const hours = settings?.opening_hours || { start: "11:45", end: "23:00" };
    const now = new Date();
    const [sh, sm] = hours.start.split(":").map(Number);
    const [eh, em] = hours.end.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= sh * 60 + sm && mins <= eh * 60 + em;
}

export function isRestaurantOpen(settings) {
    if (!settings) return true; // optimistic when no settings loaded
    if (!settings.is_open) return false;
    return isWithinHours(settings);
}

export function formatHours(settings) {
    const hours = settings?.opening_hours || { start: "11:45", end: "23:00" };
    return `Mon–Sun · ${to12h(hours.start)} – ${to12h(hours.end)}`;
}

function to12h(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

// === Delivery ETA ===
// Base 15 min + 2 min/item + ~3 min/km. Min 20, max 60.
export function calculateEta({ items = [], distanceKm = 5 }) {
    const qty = items.reduce((s, i) => s + (i.quantity || 1), 0);
    const eta = 15 + qty * 2 + (distanceKm || 5) * 3;
    return Math.max(20, Math.min(60, Math.round(eta)));
}

// Haversine distance (km) between two lat/lng pairs
export function distanceKm(a, b) {
    if (!a || !b) return null;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return Math.round(R * c * 100) / 100;
}

// Default restaurant location (used for distance calc — admin-editable later)
export const RESTAURANT_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Bengaluru
