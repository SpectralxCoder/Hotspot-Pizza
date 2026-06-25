import React, { useEffect, useState } from "react";
import { Save, Clock, Sparkles, MapPin, Phone, Building2, Locate, ToggleLeft, ToggleRight } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import MapPicker from "../components/MapPicker";
import { getSettings, updateSettings, subscribeSettings } from "../lib/menuService";
import { formatHours, DEFAULT_RESTAURANT_LOCATION } from "../lib/hours";
import { toast } from "sonner";

export default function AdminSettings() {
    const [s, setS] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await getSettings();
            setS(data);
            setForm(data ? {
                address: data.address || "",
                shop_latitude: data.shop_latitude ?? DEFAULT_RESTAURANT_LOCATION.lat,
                shop_longitude: data.shop_longitude ?? DEFAULT_RESTAURANT_LOCATION.lng,
                contact_number: data.contact_number || "",
                num_tables: data.num_tables ?? 20,
                start: data.opening_hours?.start || "11:45",
                end: data.opening_hours?.end || "23:00",
                popular_mode: data.popular_mode || "all_time",
                admin_display_name: data.admin_display_name || "",
            } : null);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        load();
        const u = subscribeSettings(load);
        return u;
    }, []);

    const save = async (patch) => {
        setSaving(true);
        try {
            const updated = await updateSettings(patch);
            setS(updated);
            toast.success("Settings saved");
        } catch (e) {
            toast.error(e?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleOpen = async () => {
        if (!s) return;
        await save({ is_open: !s.is_open });
    };

    const handleSaveShopInfo = async () => {
        if (!form) return;
        if (!form.contact_number.trim()) return toast.error("Contact number required");
        if (!form.address.trim()) return toast.error("Address required");
        if (!form.shop_latitude || !form.shop_longitude) return toast.error("GPS coordinates required");
        await save({
            address: form.address.trim(),
            shop_latitude: Number(form.shop_latitude),
            shop_longitude: Number(form.shop_longitude),
            contact_number: form.contact_number.trim(),
            num_tables: Math.max(1, Math.min(99, Number(form.num_tables) || 20)),
            admin_display_name: form.admin_display_name?.trim() || null,
        });
    };

    const handleSaveHours = async () => {
        if (form.start === form.end) return toast.error("Opening & closing time cannot be the same");
        await save({ opening_hours: { start: form.start, end: form.end } });
    };

    const handleUseGps = () => {
        if (!navigator.geolocation) return toast.error("Geolocation unavailable");
        navigator.geolocation.getCurrentPosition(
            (g) => {
                setForm((f) => ({ ...f, shop_latitude: g.coords.latitude, shop_longitude: g.coords.longitude }));
                toast.success("Location captured. Click Save to persist.");
            },
            () => toast.error("Couldn't get your location"),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    if (!s || !form) {
        return (
            <div className="space-y-6">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold">Settings</h1>
                <SetupNotice />
                <div className="bg-white rounded-2xl p-8 animate-pulse h-40" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl" data-testid="admin-settings">
            <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold">Settings</h1>
                <p className="text-sm text-muted-foreground">Shop information, hours, and operational config.</p>
            </div>
            <SetupNotice />

            {/* Open/Close */}
            <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="setting-open-card">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="font-display text-2xl font-extrabold">Restaurant status</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manual override: when OFF, kitchen is closed regardless of hours.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Auto hours: {formatHours(s)}</p>
                    </div>
                    <button
                        onClick={handleToggleOpen}
                        disabled={saving}
                        className={`px-5 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition-all ${s.is_open ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-brand text-white hover:bg-brand-700"}`}
                        data-testid="toggle-open-button"
                    >
                        {s.is_open ? <><ToggleRight className="w-5 h-5" /> Open · click to close</> : <><ToggleLeft className="w-5 h-5" /> Closed · click to open</>}
                    </button>
                </div>
            </div>

            {/* Shop info */}
            <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="setting-shop-card">
                <h2 className="font-display text-2xl font-extrabold inline-flex items-center gap-2"><Building2 className="w-5 h-5" /> Shop information</h2>
                <p className="text-sm text-muted-foreground mt-1">Shop name is fixed and visible everywhere. Address, GPS &amp; phone show on the landing footer.</p>
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <Field label="Shop name (read-only)">
                        <input value={s.shop_name || "Hotspot Pizza"} readOnly className="input opacity-90 cursor-not-allowed" data-testid="setting-shop-name" />
                    </Field>
                    <Field label="Admin display name">
                        <input value={form.admin_display_name || ""} onChange={(e) => setForm({ ...form, admin_display_name: e.target.value })} placeholder="Hotspot Admin" className="input" data-testid="setting-admin-name" />
                    </Field>
                    <Field label="Contact number" full>
                        <input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} placeholder="+91 98XXXXXXXX" className="input" data-testid="setting-phone" />
                    </Field>
                    <Field label="Address" full>
                        <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full shop address" className="input" data-testid="setting-address" />
                    </Field>
                    <Field label="Latitude">
                        <input type="number" step="any" value={form.shop_latitude} onChange={(e) => setForm({ ...form, shop_latitude: e.target.value })} className="input" data-testid="setting-lat" />
                    </Field>
                    <Field label="Longitude">
                        <input type="number" step="any" value={form.shop_longitude} onChange={(e) => setForm({ ...form, shop_longitude: e.target.value })} className="input" data-testid="setting-lng" />
                    </Field>
                    <Field label="Number of tables">
                        <input type="number" min="1" max="99" value={form.num_tables} onChange={(e) => setForm({ ...form, num_tables: e.target.value })} className="input" data-testid="setting-num-tables" />
                    </Field>
                    <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
                        <button onClick={handleUseGps} className="inline-flex items-center gap-1.5 bg-cream px-4 py-2 rounded-full text-sm font-semibold hover:bg-warmBeige" data-testid="use-gps-button">
                            <Locate className="w-4 h-4" /> Use my GPS location
                        </button>
                        <span className="text-xs text-muted-foreground">or pin on map below</span>
                    </div>
                    <div className="sm:col-span-2">
                        <MapPicker
                            value={{ lat: Number(form.shop_latitude), lng: Number(form.shop_longitude) }}
                            onChange={(p) => setForm({ ...form, shop_latitude: p.lat, shop_longitude: p.lng })}
                            height={260}
                        />
                    </div>
                </div>
                <div className="mt-5 flex justify-end">
                    <button onClick={handleSaveShopInfo} disabled={saving} className="bg-brand text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:bg-brand-700 disabled:opacity-50" data-testid="save-shop-button">
                        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save shop info"}
                    </button>
                </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="setting-hours-card">
                <h2 className="font-display text-2xl font-extrabold inline-flex items-center gap-2"><Clock className="w-5 h-5" /> Opening hours</h2>
                <p className="text-sm text-muted-foreground mt-1">Mon–Sun. Open and close cannot be the same time.</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Field label="From">
                        <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="input" data-testid="hours-start" />
                    </Field>
                    <Field label="To">
                        <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="input" data-testid="hours-end" />
                    </Field>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleSaveHours} disabled={saving} className="bg-brand text-white px-5 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2 hover:bg-brand-700 disabled:opacity-50" data-testid="save-hours-button">
                        <Save className="w-4 h-4" /> Save hours
                    </button>
                </div>
            </div>

            {/* Popularity */}
            <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="setting-popularity-card">
                <h2 className="font-display text-2xl font-extrabold inline-flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> &quot;Most popular&quot; calculation</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <button onClick={() => save({ popular_mode: "all_time" })}
                        className={`p-4 rounded-2xl border-2 text-left ${s.popular_mode === "all_time" ? "border-brand bg-brand/5" : "border-warmBeige"}`}
                        data-testid="pop-mode-alltime">
                        <p className="font-semibold">All-time favourites</p>
                        <p className="text-xs text-muted-foreground mt-1">Top items by order count across all orders.</p>
                    </button>
                    <button onClick={() => save({ popular_mode: "last_30_days" })}
                        className={`p-4 rounded-2xl border-2 text-left ${s.popular_mode === "last_30_days" ? "border-brand bg-brand/5" : "border-warmBeige"}`}
                        data-testid="pop-mode-30days">
                        <p className="font-semibold">Trending (last 30 days)</p>
                        <p className="text-xs text-muted-foreground mt-1">Recently rising items.</p>
                    </button>
                </div>
            </div>

            <style>{`.input{width:100%;padding:0.75rem 1rem;border-radius:1rem;background:#F5EFE6;outline:none}.input:focus{box-shadow:0 0 0 2px rgba(239,68,68,0.3)}`}</style>
        </div>
    );
}

function Field({ label, full, children }) {
    return (
        <div className={full ? "sm:col-span-2" : ""}>
            <label className="text-sm font-semibold">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}
