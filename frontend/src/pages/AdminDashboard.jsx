import React, { useEffect, useMemo, useState } from "react";
import { ListOrdered, IndianRupee, ShoppingBag, TrendingUp } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listActiveOrders, listAllOrders, subscribeOrders } from "../lib/orders";

function StatCard({ Icon, label, value, accent, testid }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-warmBorder shadow-soft" data-testid={testid}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${accent}`}>
                    <Icon className="w-4 h-4 text-white" />
                </span>
            </div>
            <p className="font-display text-3xl mt-2">{value}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const [allOrders, setAllOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);

    const load = async () => {
        try {
            const [all, active] = await Promise.all([listAllOrders(), listActiveOrders()]);
            setAllOrders(all);
            setActiveOrders(active);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load();
        const unsub = subscribeOrders(load);
        return unsub;
    }, []);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todays = allOrders.filter((o) => new Date(o.created_at) >= today);
        const revenue = todays.reduce((s, o) => s + Number(o.total_amount || 0), 0);
        const avg = todays.length ? Math.round(revenue / todays.length) : 0;

        // Top items
        const counts = new Map();
        for (const o of todays) {
            for (const it of o.order_items || []) {
                counts.set(it.item_name, (counts.get(it.item_name) || 0) + it.quantity);
            }
        }
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

        return { active: activeOrders.length, todaysCount: todays.length, revenue, avg, top };
    }, [allOrders, activeOrders]);

    const recent = allOrders.slice(0, 8);

    return (
        <div className="space-y-6" data-testid="admin-dashboard">
            <div>
                <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Real-time overview of your restaurant.</p>
            </div>
            <SetupNotice />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard Icon={ListOrdered} label="Active Orders" value={stats.active} accent="bg-brand" testid="stat-active-orders" />
                <StatCard Icon={ShoppingBag} label="Orders Today" value={stats.todaysCount} accent="bg-warmOrange" testid="stat-orders-today" />
                <StatCard Icon={IndianRupee} label="Revenue Today" value={`₹${stats.revenue}`} accent="bg-emerald-600" testid="stat-revenue-today" />
                <StatCard Icon={TrendingUp} label="Avg Order Value" value={`₹${stats.avg}`} accent="bg-blue-600" testid="stat-avg-order" />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-warmBorder shadow-soft" data-testid="recent-orders-panel">
                    <h2 className="font-display text-xl mb-4">Recent Orders</h2>
                    {recent.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                    ) : (
                        <div className="divide-y divide-warmBorder">
                            {recent.map((o) => (
                                <div key={o.id} className="flex items-center justify-between py-3" data-testid={`recent-order-${o.id}`}>
                                    <div>
                                        <p className="font-medium text-sm">{o.order_number}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {o.customer_name} ·{" "}
                                            {o.mode === "dine_in" ? `Table ${o.table_number}` : "Delivery"} ·{" "}
                                            {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{o.total_amount}</p>
                                        <StatusBadge status={o.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-warmBorder shadow-soft" data-testid="top-items-panel">
                    <h2 className="font-display text-xl mb-4">Top Items Today</h2>
                    {stats.top.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nothing yet today.</p>
                    ) : (
                        <ul className="space-y-3">
                            {stats.top.map(([name, qty], i) => (
                                <li key={name} className="flex items-center justify-between text-sm">
                                    <span><span className="text-muted-foreground mr-2">#{i + 1}</span>{name}</span>
                                    <span className="font-medium">{qty}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export function StatusBadge({ status }) {
    const colors = {
        Received: "bg-blue-50 text-blue-700 border-blue-200",
        Preparing: "bg-amber-50 text-amber-700 border-amber-200",
        Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Done: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${colors[status] || colors.Received}`} data-testid={`status-badge-${status?.toLowerCase()}`}>
            {status}
        </span>
    );
}
