// Seed-data helper to populate menu_items from the static catalogue once.
// Run from the admin Menu Manager → "Seed default menu" button (idempotent).
import { supabase } from "./supabase";
import { MENU } from "../data/menu";

export async function seedMenuItems() {
    const { data: existing, error: e1 } = await supabase
        .from("menu_items")
        .select("id", { count: "exact" });
    if (e1) throw e1;
    if (existing && existing.length > 0) {
        return { inserted: 0, message: "Menu already has items — skipped." };
    }
    const rows = MENU.map((m, idx) => ({
        name: m.name,
        description: m.description,
        category: m.category,
        price: m.price ?? null,
        sizes: m.sizes ?? null,
        image_url: m.image,
        in_stock: true,
        is_popular: false,
        sort_order: idx,
    }));
    const { error } = await supabase.from("menu_items").insert(rows);
    if (error) throw error;
    return { inserted: rows.length };
}
