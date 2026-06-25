// Calculation helpers: hours, ETA, distance
// Restaurant: G16A, Block G, Sector 23, Sanjay Nagar, Ghaziabad, UP 201017
export const DEFAULT_RESTAURANT_LOCATION = { lat: 28.690931, lng: 77.454294 };
export const DEFAULT_HOURS = { start: "11:45", end: "23:00" };
export const FREE_DELIVERY_MIN_ORDER = 200;
export const FREE_DELIVERY_RADIUS_KM = 3;
export const TRAVEL_SPEED_KMPH = 32; // 30-35 kmph
export const PREP_TIME_MIN = 20;     // base prep time

export function isWithinHours(settings) {
    const hours = settings?.opening_hours || DEFAULT_HOURS;
    const now = new Date();
    const [sh, sm] = hours.start.split(":").map(Number);
    const [eh, em] = hours.end.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= sh * 60 + sm && mins < eh * 60 + em;
}

export function isRestaurantOpen(settings) {
    if (!settings) return true;
    if (!settings.is_open) return false;
    return isWithinHours(settings);
}

export function formatHours(settings) {
    const hours = settings?.opening_hours || DEFAULT_HOURS;
    return `Mon–Sun · ${to12h(hours.start)} – ${to12h(hours.end)}`;
}

function to12h(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${String(m).padStart(2, "0")} ${period}`;
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
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return Math.round(R * c * 100) / 100;
}

// ETA = travel time (distance / 32 kmph) + 20 min prep buffer
export function calculateEta({ distanceKm: d }) {
    if (d == null) return PREP_TIME_MIN + 10;
    const travelMin = (d / TRAVEL_SPEED_KMPH) * 60;
    return Math.round(travelMin + PREP_TIME_MIN);
}

export function restaurantLocationFromSettings(settings) {
    if (!settings?.shop_latitude || !settings?.shop_longitude) return DEFAULT_RESTAURANT_LOCATION;
    return { lat: Number(settings.shop_latitude), lng: Number(settings.shop_longitude) };
}

export function within24h(then) {
    if (!then) return false;
    return (Date.now() - new Date(then).getTime()) < 24 * 3600 * 1000;
}

// Legacy export for backward compatibility
export const RESTAURANT_LOCATION = DEFAULT_RESTAURANT_LOCATION;
