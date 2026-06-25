import { supabase, isSupabaseConfigured, genOrderNumber } from "./supabase";

export const ORDER_STATUSES = ["Accepted", "Preparing", "Out For Delivery", "Delivered"];
export const ACTIVE_STATUSES = ["Accepted", "Preparing", "Out For Delivery"];

export async function placeOrder({
    customer_name, phone, address, table_number, mode, items, total_amount,
    latitude = null, longitude = null, distance_km = null, eta_minutes = null, location_label = null,
    is_open = true,
}) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const order_number = genOrderNumber();
    const initialStatus = is_open ? "Accepted" : "Received";

    const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
            order_number,
            customer_name,
            phone: phone || null,
            address: address || null,
            table_number: table_number ?? null,
            mode,
            status: initialStatus,
            total_amount,
            latitude,
            longitude,
            distance_km,
            eta_minutes,
            location_label,
        })
        .select()
        .single();
    if (orderErr) throw orderErr;

    const itemsPayload = items.map((it) => ({
        order_id: orderRow.id,
        item_name: it.name,
        size: it.size || null,
        quantity: it.quantity,
        price: it.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    return orderRow;
}

export async function getOrderById(id) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

export async function listActiveOrders() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .in("status", ACTIVE_STATUSES)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function listAllOrders(sinceIso = null) {
    if (!isSupabaseConfigured) return [];
    let q = supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(1000);
    if (sinceIso) q = q.gte("created_at", sinceIso);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
}

export async function updateOrderStatus(id, status, extra = {}) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const { data: updated, error } = await supabase
        .from("orders")
        .update({ status, ...extra })
        .eq("id", id)
        .select("*, order_items(*)")
        .single();
    if (error) throw error;
    // Auto-archive on Delivered
    if (status === "Delivered") {
        await archiveOrder(updated, { skipDelete: false, skipStatusUpdate: true });
    }
    return updated;
}

export async function rejectOrder(id, reason) {
    return updateOrderStatus(id, "Rejected", { rejection_reason: reason || null });
}

export async function archiveOrder(order, { skipDelete = false, skipStatusUpdate = false } = {}) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    if (!skipStatusUpdate) {
        await supabase.from("orders").update({ status: "Delivered" }).eq("id", order.id);
    }
    await supabase.from("archived_orders").insert({
        original_order_id: order.id,
        customer_name: order.customer_name,
        order_data: order,
        completed_at: new Date().toISOString(),
    });
    if (!skipDelete) {
        await supabase.from("orders").delete().eq("id", order.id);
    }
    return true;
}

export async function listArchive() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from("archived_orders")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(500);
    if (error) throw error;
    return data || [];
}

export function subscribeOrders(onChange) {
    if (!isSupabaseConfigured) return () => {};
    try {
        const channel = supabase
            .channel("orders-feed")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => onChange())
            .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => onChange())
            .subscribe((s, err) => { if (err) console.warn("orders realtime:", err?.message || s); });
        return () => { try { supabase.removeChannel(channel); } catch { /* ignore */ } };
    } catch (e) { console.warn(e?.message); return () => {}; }
}

export function subscribeArchive(onChange) {
    if (!isSupabaseConfigured) return () => {};
    try {
        const channel = supabase
            .channel("archive-feed")
            .on("postgres_changes", { event: "*", schema: "public", table: "archived_orders" }, () => onChange())
            .subscribe((s, err) => { if (err) console.warn("archive realtime:", err?.message || s); });
        return () => { try { supabase.removeChannel(channel); } catch { /* ignore */ } };
    } catch (e) { console.warn(e?.message); return () => {}; }
}

export function subscribeOrderById(id, onUpdate) {
    if (!isSupabaseConfigured) return () => {};
    try {
        const channel = supabase
            .channel(`order-${id}`)
            .on("postgres_changes",
                { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` },
                (payload) => onUpdate(payload.new))
            .subscribe((s, err) => { if (err) console.warn("order realtime:", err?.message || s); });
        return () => { try { supabase.removeChannel(channel); } catch { /* ignore */ } };
    } catch (e) { console.warn(e?.message); return () => {}; }
}
