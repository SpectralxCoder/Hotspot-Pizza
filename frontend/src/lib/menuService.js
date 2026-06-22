import { supabase, isSupabaseConfigured } from "./supabase";

// Categories displayed in admin / customer menu
export const CATEGORIES = [
    "Combos", "Snacks", "Desserts", "Garlic Bread", "Shakes",
    "Simple Veg Pizza", "Veg Special", "Veg Treat", "Feast Special",
    "Hot Pizza Special", "Burgers",
];

export async function listMenuItems() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data || [];
}

export function subscribeMenuItems(onChange) {
    if (!isSupabaseConfigured) return () => {};
    const ch = supabase
        .channel("menu-items")
        .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, onChange)
        .subscribe();
    return () => supabase.removeChannel(ch);
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
    if (error) throw error;
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
    const ch = supabase
        .channel("settings")
        .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_settings" }, onChange)
        .subscribe();
    return () => supabase.removeChannel(ch);
}

// === Popularity ===
// Compute most-ordered items from order_items + archived_orders for a window.
// Returns Map<lowercased_item_name, totalQty>
export async function computePopularity(mode = "all_time") {
    if (!isSupabaseConfigured) return new Map();
    let since = null;
    if (mode === "last_30_days") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        since = d.toISOString();
    }
    // Active orders
    let q1 = supabase.from("order_items").select("item_name, quantity, orders!inner(created_at)");
    if (since) q1 = q1.gte("orders.created_at", since);
    const { data: live } = await q1;
    const map = new Map();
    for (const r of live || []) {
        const k = (r.item_name || "").toLowerCase();
        map.set(k, (map.get(k) || 0) + (r.quantity || 0));
    }
    // Archived
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
    return map;
}
