import React, { useEffect, useState } from "react";
import { Clock, MapPin, UtensilsCrossed, X, XCircle } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listActiveOrders, ORDER_STATUSES, subscribeOrders, updateOrderStatus, rejectOrder } from "../lib/orders";
import { StatusBadge } from "./AdminDashboard";
import { toast } from "sonner";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectFor, setRejectFor] = useState(null);

    const load = async () => {
        try { setOrders(await listActiveOrders()); }
        catch (e) { console.warn(e?.message); setOrders([]); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        const u = subscribeOrders(load);
        return u;
    }, []);

    const handleStatusChange = async (order, status) => {
        try {
            await updateOrderStatus(order.id, status);
            toast.success(`Order → ${status}`);
        } catch (e) { toast.error(e?.message || "Update failed"); }
    };

    const handleReject = async (reason) => {
        if (!rejectFor) return;
        try {
            await rejectOrder(rejectFor.id, reason);
            toast.success(`Order rejected${reason ? ` (${reason})` : ""}`);
            setRejectFor(null);
        } catch (e) { toast.error(e?.message || "Reject failed"); }
    };

    return (
        <div className="space-y-6" data-testid="admin-orders-page">
            <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold">Active Orders</h1>
                <p className="text-sm text-muted-foreground">Manage live orders. Delivered orders auto-archive.</p>
            </div>
            <SetupNotice />

            {loading ? (
                <div className="bg-white rounded-2xl p-8 animate-pulse h-40" />
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center" data-testid="orders-empty">
                    <p className="font-display text-2xl font-extrabold">No active orders</p>
                    <p className="text-sm text-muted-foreground mt-1">New orders appear here in real time.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-5">
                    {orders.map((o) => (
                        <article key={o.id} className="bg-white rounded-2xl p-6 shadow-soft" data-testid={`order-card-${o.id}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-display text-xl font-extrabold">{o.order_number}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" /> {new Date(o.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <StatusBadge status={o.status} />
                            </div>

                            <div className="text-sm space-y-1 mb-3">
                                <p><span className="text-muted-foreground">Customer:</span> <span className="font-semibold">{o.customer_name}</span></p>
                                {o.mode === "dine_in" ? (
                                    <p className="flex items-center gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5 text-brand" /> Table {o.table_number}</p>
                                ) : (
                                    <>
                                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand" /> {o.address}</p>
                                        <p className="text-muted-foreground">📞 {o.phone}</p>
                                        {o.eta_minutes && <p className="text-xs">ETA: {o.eta_minutes} min{o.distance_km ? ` · ${o.distance_km} km` : ""}</p>}
                                    </>
                                )}
                            </div>

                            <ul className="text-sm space-y-1 mb-4 border-t border-warmBeige pt-3">
                                {o.order_items?.map((it) => (
                                    <li key={it.id} className="flex items-center justify-between">
                                        <span>{it.quantity}× {it.item_name}{it.size ? ` (${it.size})` : ""}</span>
                                        <span className="text-muted-foreground">₹{it.price * it.quantity}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center justify-between pt-3 border-t border-warmBeige gap-2 flex-wrap">
                                <p className="font-display text-2xl font-extrabold">₹{o.total_amount}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select value={o.status} onChange={(e) => handleStatusChange(o, e.target.value)}
                                        className="text-sm border border-warmBeige rounded-full px-3 py-1.5 bg-white focus:outline-none focus:border-brand" data-testid={`status-select-${o.id}`}>
                                        {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                                    </select>
                                    <button onClick={() => setRejectFor(o)} className="text-sm bg-brand/10 text-brand px-3 py-1.5 rounded-full font-semibold hover:bg-brand hover:text-white transition-all inline-flex items-center gap-1" data-testid={`reject-${o.id}`}>
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {rejectFor && (<RejectDialog onClose={() => setRejectFor(null)} onSubmit={handleReject} orderNumber={rejectFor.order_number} />)}
        </div>
    );
}

function RejectDialog({ onClose, onSubmit, orderNumber }) {
    const [reason, setReason] = useState("");
    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] p-6 w-full max-w-md" data-testid="reject-dialog">
                <div className="flex items-start justify-between">
                    <h3 className="font-display text-2xl font-extrabold">Reject order</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream" data-testid="reject-close"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Order <span className="font-semibold">{orderNumber}</span>. Reason is optional but recommended.</p>
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Item unavailable, address out of zone..." className="mt-4 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="reject-reason" />
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-full font-semibold text-sm bg-cream hover:bg-warmBeige" data-testid="reject-cancel">Cancel</button>
                    <button onClick={() => onSubmit(reason.trim())} className="px-5 py-2.5 rounded-full font-semibold text-sm bg-brand text-white hover:bg-brand-700" data-testid="reject-confirm">Reject order</button>
                </div>
            </div>
        </div>
    );
}
