import { supabase, isSupabaseConfigured } from "./supabase";

// Categories displayed in admin / customer menu
export const CATEGORIES = [
    "Combos", "Snacks", "Desserts", "Garlic Bread", "Shakes",
    "Simple Veg Pizza", "Veg Special", "Veg Treat", "Feast Special",
    "Hot Pizza Special", "Burgers",
];

// "Table does not exist" error code from PostgREST when schema_v2.sql isn't applied
const isMissingTable = (err) => err?.code === "PGRST205" || /could not find the table/i.test(err?.message || "");

export async function listMenuItems() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });
    if (error) {
        if (isMissingTable(error)) return [];
        throw error;
    }
    return data || [];
}

export function subscribeMenuItems(onChange) {
    if (!isSupabaseConfigured) return () => {};
    try {
        const ch = supabase
            .channel("menu-items")
            .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, onChange)
            .subscribe((status, err) => {
                if (err) console.warn("menu_items realtime:", err?.message || status);
            });
        return () => { try { supabase.removeChannel(ch); } catch { /* ignore */ } };
    } catch (e) {
        console.warn("subscribeMenuItems failed:", e?.message);
        return () => {};
    }
}

export async function createMenuItem(payload) {
    const { data, error } = await supabase.from("menu_items").insert(payload).select().single();
    if (error) throw error;
    return data;
}

export async function updateMenuItem(id, payload) {
    const { data, error } = await supabase.from("menu_items").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteMenuItem(id) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw error;
    return true;
}

export async function uploadMenuImage(file) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const ext = file.name.split(".").pop();
    const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("menu-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
    return { publicUrl: data.publicUrl, path };
}

// === Restaurant settings ===
export async function getSettings() {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from("restaurant_settings").select("*").eq("id", 1).maybeSingle();
    if (error) {
        if (isMissingTable(error)) return null;
        throw error;
    }
    return data;
}

export async function updateSettings(payload) {
    const { data, error } = await supabase
        .from("restaurant_settings")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", 1)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export function subscribeSettings(onChange) {
    if (!isSupabaseConfigured) return () => {};
    try {
        const ch = supabase
            .channel("settings")
            .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_settings" }, onChange)
            .subscribe((status, err) => {
                if (err) console.warn("settings realtime:", err?.message || status);
            });
        return () => { try { supabase.removeChannel(ch); } catch { /* ignore */ } };
    } catch (e) {
        console.warn("subscribeSettings failed:", e?.message);
        return () => {};
    }
}

// === Popularity ===
export async function computePopularity(mode = "all_time") {
    if (!isSupabaseConfigured) return new Map();
    let since = null;
    if (mode === "last_30_days") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        since = d.toISOString();
    }
    const map = new Map();
    try {
        let q1 = supabase.from("order_items").select("item_name, quantity, orders!inner(created_at)");
        if (since) q1 = q1.gte("orders.created_at", since);
        const { data: live } = await q1;
        for (const r of live || []) {
            const k = (r.item_name || "").toLowerCase();
            map.set(k, (map.get(k) || 0) + (r.quantity || 0));
        }
    } catch { /* ignore */ }
    try {
        let q2 = supabase.from("archived_orders").select("order_data, completed_at");
        if (since) q2 = q2.gte("completed_at", since);
        const { data: arch } = await q2;
        for (const a of arch || []) {
            const items = a.order_data?.order_items || [];
            for (const it of items) {
                const k = (it.item_name || "").toLowerCase();
                map.set(k, (map.get(k) || 0) + (it.quantity || 0));
            }
        }
    } catch { /* ignore */ }
    return map;
}

// Helper exposed for UI: does the v2 schema appear to be applied?
export async function isV2SchemaApplied() {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from("menu_items").select("id", { head: true, count: "exact" }).limit(1);
    if (error && isMissingTable(error)) return false;
    return true;
}
