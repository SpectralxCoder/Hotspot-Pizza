import React, { useEffect, useState } from "react";
import { Save, Clock, Sparkles } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { getSettings, updateSettings, subscribeSettings } from "../lib/menuService";
import { formatHours } from "../lib/hours";
import { toast } from "sonner";

export default function AdminSettings() {
    const [settings, setSettings] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try { setSettings(await getSettings()); } catch { /* ignore */ }
    };
    useEffect(() => {
        load();
        const u = subscribeSettings(load);
        return u;
    }, []);

    const save = async (patch) => {
        setBusy(true);
        try {
            const updated = await updateSettings(patch);
            setSettings(updated);
            toast.success("Settings saved");
        } catch (e) {
            toast.error(e?.message || "Save failed");
        } finally {
            setBusy(false);
        }
    };

    if (!settings) {
        return (
            <div className="space-y-6">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold">Settings</h1>
                <SetupNotice />
                <div className="bg-white rounded-2xl p-8 animate-pulse h-40" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="admin-settings">
            <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold">Settings</h1>
                <p className="text-sm text-muted-foreground">Restaurant hours, open/close, popularity mode.</p>
            </div>
            <SetupNotice />

            <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="setting-open-card">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="font-display text-2xl font-extrabold">Restaurant status</h2>
                            <p className="text-sm text-muted-foreground mt-1">{settings.is_open ? "Open for orders." : "Manually closed."}</p>
                            <p className="text-xs text-muted-foreground mt-2">Operating hours: {formatHours(settings)}</p>
                        </div>
                        <button
                            onClick={() => save({ is_open: !settings.is_open })}
                            disabled={busy}
                            className={`px-5 py-3 rounded-full font-semibold text-sm transition-all ${settings.is_open ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-brand text-white hover:bg-brand-700"}`}
                            data-testid="toggle-open-button"
                        >
                            {settings.is_open ? "Open · Click to close" : "Closed · Click to open"}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="setting-hours-card">
                    <h2 className="font-display text-2xl font-extrabold inline-flex items-center gap-2"><Clock className="w-5 h-5" /> Opening hours</h2>
                    <p className="text-sm text-muted-foreground mt-1">Customers can only order during these hours.</p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <label className="text-sm font-semibold">
                            From
                            <input type="time" defaultValue={settings.opening_hours?.start || "11:45"} onBlur={(e) => save({ opening_hours: { ...settings.opening_hours, start: e.target.value } })}
                                className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="hours-start" />
                        </label>
                        <label className="text-sm font-semibold">
                            To
                            <input type="time" defaultValue={settings.opening_hours?.end || "23:00"} onBlur={(e) => save({ opening_hours: { ...settings.opening_hours, end: e.target.value } })}
                                className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="hours-end" />
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-soft lg:col-span-2" data-testid="setting-popularity-card">
                    <h2 className="font-display text-2xl font-extrabold inline-flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> &quot;Most popular&quot; calculation</h2>
                    <p className="text-sm text-muted-foreground mt-1">Choose how the popularity badge is computed for menu items.</p>
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                        <button onClick={() => save({ popular_mode: "all_time" })}
                            className={`p-4 rounded-2xl border-2 text-left ${settings.popular_mode === "all_time" ? "border-brand bg-brand/5" : "border-warmBeige"}`}
                            data-testid="pop-mode-alltime">
                            <p className="font-semibold">All-time favourites</p>
                            <p className="text-xs text-muted-foreground mt-1">Top items by order count across all orders.</p>
                        </button>
                        <button onClick={() => save({ popular_mode: "last_30_days" })}
                            className={`p-4 rounded-2xl border-2 text-left ${settings.popular_mode === "last_30_days" ? "border-brand bg-brand/5" : "border-warmBeige"}`}
                            data-testid="pop-mode-30days">
                            <p className="font-semibold">Trending (last 30 days)</p>
                            <p className="text-xs text-muted-foreground mt-1">Recently rising items.</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
