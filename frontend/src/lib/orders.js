import { supabase, isSupabaseConfigured, genOrderNumber } from "./supabase";

export const ORDER_STATUSES = ["Received", "Preparing", "Ready", "Delivered", "Done"];
export const ACTIVE_STATUSES = ["Received", "Preparing", "Ready", "Delivered"];

export async function placeOrder({ customer_name, phone, address, table_number, mode, items, total_amount }) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const order_number = genOrderNumber();

    const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
            order_number,
            customer_name,
            phone: phone || null,
            address: address || null,
            table_number: table_number ?? null,
            mode,
            status: "Received",
            total_amount,
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

export async function listAllOrders() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(500);
    if (error) throw error;
    return data || [];
}

export async function updateOrderStatus(id, status) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function archiveOrder(order) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    // First mark as Done
    await supabase.from("orders").update({ status: "Done" }).eq("id", order.id);
    // Copy to archive
    const { error: archErr } = await supabase.from("archived_orders").insert({
        original_order_id: order.id,
        customer_name: order.customer_name,
        order_data: order,
        completed_at: new Date().toISOString(),
    });
    if (archErr) throw archErr;
    // Remove the active order
    const { error: delErr } = await supabase.from("orders").delete().eq("id", order.id);
    if (delErr) throw delErr;
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
    const channel = supabase
        .channel("orders-feed")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => onChange())
        .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => onChange())
        .subscribe();
    return () => supabase.removeChannel(channel);
}

export function subscribeArchive(onChange) {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase
        .channel("archive-feed")
        .on("postgres_changes", { event: "*", schema: "public", table: "archived_orders" }, () => onChange())
        .subscribe();
    return () => supabase.removeChannel(channel);
}

export function subscribeOrderById(id, onUpdate) {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase
        .channel(`order-${id}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` },
            (payload) => onUpdate(payload.new)
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
}
