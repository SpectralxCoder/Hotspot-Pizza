import React, { useEffect, useState } from "react";
import { Clock, ChefHat, CheckCheck } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listActiveOrders, subscribeOrders, updateOrderStatus } from "../lib/orders";
import { toast } from "sonner";

function minutesAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    return diff <= 0 ? "just now" : `${diff} min`;
}

export default function KitchenDisplay() {
    const [orders, setOrders] = useState([]);
    const [, setTick] = useState(0);

    const load = async () => {
        try {
            const data = await listActiveOrders();
            // Only show Received & Preparing on KDS
            setOrders(data.filter((o) => ["Received", "Preparing", "Ready"].includes(o.status)));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load();
        const unsub = subscribeOrders(load);
        const t = setInterval(() => setTick((n) => n + 1), 30000);
        return () => {
            unsub();
            clearInterval(t);
        };
    }, []);

    return (
        <div className="space-y-6" data-testid="kds-page">
            <div>
                <h1 className="font-display text-3xl md:text-4xl">Kitchen Display</h1>
                <p className="text-sm text-muted-foreground">Live tickets for the kitchen line.</p>
            </div>
            <SetupNotice />

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-warmBeige text-center" data-testid="kds-empty">
                    <p className="font-display text-2xl">All caught up! 🎉</p>
                    <p className="text-sm text-muted-foreground mt-1">No active tickets in the kitchen.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {orders.map((o) => (
                        <div
                            key={o.id}
                            className="bg-white rounded-2xl border-2 shadow-soft overflow-hidden"
                            style={{
                                borderColor: o.status === "Preparing" ? "#F59E0B" : o.status === "Ready" ? "#10B981" : "#3B82F6",
                            }}
                            data-testid={`kds-ticket-${o.id}`}
                        >
                            <div
                                className="px-4 py-3 flex items-center justify-between text-white"
                                style={{
                                    background: o.status === "Preparing" ? "#F59E0B" : o.status === "Ready" ? "#10B981" : "#3B82F6",
                                }}
                            >
                                <p className="font-display text-lg leading-none">{o.order_number}</p>
                                <p className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {minutesAgo(o.created_at)}</p>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-muted-foreground mb-1">
                                    {o.mode === "dine_in" ? `Dine-in · Table ${o.table_number}` : "Delivery"}
                                </p>
                                <p className="font-medium text-sm mb-3">{o.customer_name}</p>
                                <ul className="space-y-1.5 text-sm">
                                    {o.order_items?.map((it) => (
                                        <li key={it.id} className="flex justify-between">
                                            <span><span className="font-bold text-brand mr-1">{it.quantity}×</span>{it.item_name}{it.size ? ` (${it.size})` : ""}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 flex gap-2">
                                    {o.status === "Received" && (
                                        <button
                                            onClick={async () => {
                                                await updateOrderStatus(o.id, "Preparing");
                                                toast.success("Started preparing");
                                            }}
                                            className="flex-1 bg-amber-500 text-white text-sm px-3 py-2 rounded-full hover:bg-amber-600 inline-flex items-center justify-center gap-1.5"
                                            data-testid={`kds-start-${o.id}`}
                                        >
                                            <ChefHat className="w-4 h-4" /> Start
                                        </button>
                                    )}
                                    {o.status === "Preparing" && (
                                        <button
                                            onClick={async () => {
                                                await updateOrderStatus(o.id, "Ready");
                                                toast.success("Marked ready");
                                            }}
                                            className="flex-1 bg-emerald-600 text-white text-sm px-3 py-2 rounded-full hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5"
                                            data-testid={`kds-ready-${o.id}`}
                                        >
                                            <CheckCheck className="w-4 h-4" /> Mark Ready
                                        </button>
                                    )}
                                    {o.status === "Ready" && (
                                        <span className="flex-1 text-emerald-700 bg-emerald-50 border border-emerald-200 text-sm py-2 rounded-full inline-flex items-center justify-center gap-1.5">
                                            <CheckCheck className="w-4 h-4" /> Ready
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
