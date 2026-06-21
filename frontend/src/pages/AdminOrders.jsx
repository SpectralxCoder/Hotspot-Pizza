import React, { useEffect, useState } from "react";
import { Clock, MapPin, UtensilsCrossed } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { archiveOrder, listActiveOrders, ORDER_STATUSES, subscribeOrders, updateOrderStatus } from "../lib/orders";
import { StatusBadge } from "./AdminDashboard";
import { toast } from "sonner";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const data = await listActiveOrders();
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const unsub = subscribeOrders(load);
        return unsub;
    }, []);

    const handleStatusChange = async (order, status) => {
        try {
            await updateOrderStatus(order.id, status);
            toast.success(`Order ${order.order_number} → ${status}`);
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleMarkDone = async (order) => {
        if (!window.confirm(`Mark order ${order.order_number} as Done & archive?`)) return;
        try {
            await archiveOrder(order);
            toast.success("Order archived");
        } catch (e) {
            toast.error("Failed to archive order");
        }
    };

    return (
        <div className="space-y-6" data-testid="admin-orders-page">
            <div>
                <h1 className="font-display text-3xl md:text-4xl">Active Orders</h1>
                <p className="text-sm text-muted-foreground">Manage live orders from your customers.</p>
            </div>
            <SetupNotice />

            {loading ? (
                <div className="bg-white rounded-2xl p-8 border border-warmBorder animate-pulse h-40" />
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-warmBorder text-center" data-testid="orders-empty">
                    <p className="font-display text-2xl">No active orders</p>
                    <p className="text-sm text-muted-foreground mt-1">New orders will appear here in real time.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-5">
                    {orders.map((o) => (
                        <article
                            key={o.id}
                            className="bg-white rounded-2xl p-6 border border-warmBorder shadow-soft"
                            data-testid={`order-card-${o.id}`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-display text-xl">{o.order_number}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(o.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <StatusBadge status={o.status} />
                            </div>

                            <div className="text-sm space-y-1 mb-3">
                                <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{o.customer_name}</span></p>
                                {o.mode === "dine_in" ? (
                                    <p className="flex items-center gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5 text-brand" /> Table {o.table_number}</p>
                                ) : (
                                    <>
                                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand" /> {o.address}</p>
                                        <p className="text-muted-foreground">📞 {o.phone}</p>
                                    </>
                                )}
                            </div>

                            <ul className="text-sm space-y-1 mb-4 border-t border-warmBorder pt-3">
                                {o.order_items?.map((it) => (
                                    <li key={it.id} className="flex items-center justify-between">
                                        <span>{it.quantity}× {it.item_name}{it.size ? ` (${it.size})` : ""}</span>
                                        <span className="text-muted-foreground">₹{it.price * it.quantity}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center justify-between pt-3 border-t border-warmBorder">
                                <p className="font-display text-2xl text-brand">₹{o.total_amount}</p>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={o.status}
                                        onChange={(e) => handleStatusChange(o, e.target.value)}
                                        className="text-sm border border-warmBorder rounded-full px-3 py-1.5 bg-white focus:outline-none focus:border-brand"
                                        data-testid={`status-select-${o.id}`}
                                    >
                                        {ORDER_STATUSES.filter((s) => s !== "Done").map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleMarkDone(o)}
                                        className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-full hover:bg-emerald-700 transition-colors"
                                        data-testid={`mark-done-${o.id}`}
                                    >
                                        Mark Done
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
