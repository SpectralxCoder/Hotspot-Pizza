import React, { useEffect, useMemo, useState } from "react";
import { ListOrdered, IndianRupee, ShoppingBag, TrendingUp } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listActiveOrders, listAllOrders, subscribeOrders } from "../lib/orders";
import { useSettings } from "../contexts/SettingsContext";

const RANGES = [
    { id: "today", label: "Today", days: 1 },
    { id: "week", label: "This Week", days: 7 },
    { id: "month", label: "This Month", days: 30 },
    { id: "3m", label: "Last 3 Months", days: 90 },
    { id: "6m", label: "Last 6 Months", days: 180 },
    { id: "year", label: "This Year", days: 365 },
    { id: "all", label: "All-time", days: null },
];

export default function AdminDashboard() {
    const [allOrders, setAllOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [range, setRange] = useState("today");
    const { settings } = useSettings();
    const adminName = settings?.admin_display_name?.trim() || "Admin";

    const load = async () => {
        try {
            const [all, active] = await Promise.all([listAllOrders(), listActiveOrders()]);
            setAllOrders(all);
            setActiveOrders(active);
        } catch (e) { console.warn(e?.message); }
    };

    useEffect(() => {
        load();
        const u = subscribeOrders(load);
        return u;
    }, []);

    const rangeMeta = RANGES.find((r) => r.id === range) || RANGES[0];

    const inRange = useMemo(() => {
        if (!rangeMeta.days) return allOrders;
        const since = new Date();
        if (range === "today") { since.setHours(0,0,0,0); }
        else if (range === "year") { since.setMonth(0, 1); since.setHours(0,0,0,0); }
        else { since.setDate(since.getDate() - rangeMeta.days); }
        return allOrders.filter((o) => new Date(o.created_at) >= since);
    }, [allOrders, range, rangeMeta]);

    const stats = useMemo(() => {
        const revenue = inRange.reduce((s, o) => s + Number(o.total_amount || 0), 0);
        const avg = inRange.length ? Math.round(revenue / inRange.length) : 0;
        const counts = new Map();
        for (const o of inRange) {
            for (const it of o.order_items || []) {
                counts.set(it.item_name, (counts.get(it.item_name) || 0) + it.quantity);
            }
        }
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
        return { active: activeOrders.length, count: inRange.length, revenue, avg, top };
    }, [inRange, activeOrders]);

    const recent = inRange.slice(0, 8);

    return (
        <div className="space-y-6" data-testid="admin-dashboard">
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold" data-testid="admin-greeting">Hello, {adminName}</h1>
                    <p className="text-sm text-muted-foreground">Real-time overview of your restaurant.</p>
                </div>
                <select value={range} onChange={(e) => setRange(e.target.value)} className="px-4 py-2.5 rounded-full bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-soft" data-testid="range-filter">
                    {RANGES.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
                </select>
            </div>
            <SetupNotice />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard Icon={ListOrdered} label="Active Orders" value={stats.active} accent="bg-brand" testid="stat-active-orders" />
                <StatCard Icon={ShoppingBag} label={`Orders · ${rangeMeta.label}`} value={stats.count} accent="bg-amber-500" testid="stat-orders-range" />
                <StatCard Icon={IndianRupee} label={`Revenue · ${rangeMeta.label}`} value={`₹${stats.revenue}`} accent="bg-emerald-600" testid="stat-revenue-range" />
                <StatCard Icon={TrendingUp} label="Avg Order Value" value={`₹${stats.avg}`} accent="bg-blue-600" testid="stat-avg-order" />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft" data-testid="recent-orders-panel">
                    <h2 className="font-display text-xl font-extrabold mb-4">Recent Orders</h2>
                    {recent.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No orders yet for this period.</p>
                    ) : (
                        <div className="divide-y divide-warmBeige">
                            {recent.map((o) => (
                                <div key={o.id} className="flex items-center justify-between py-3" data-testid={`recent-order-${o.id}`}>
                                    <div>
                                        <p className="font-semibold text-sm">{o.order_number}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {o.customer_name} · {o.mode === "dine_in" ? `Table ${o.table_number}` : "Delivery"} · {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">₹{o.total_amount}</p>
                                        <StatusBadge status={o.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="top-items-panel">
                    <h2 className="font-display text-xl font-extrabold mb-4">Top Items</h2>
                    {stats.top.length === 0 ? (<p className="text-sm text-muted-foreground">No data.</p>) : (
                        <ul className="space-y-3">
                            {stats.top.map(([name, qty], i) => (
                                <li key={name} className="flex items-center justify-between text-sm">
                                    <span><span className="text-muted-foreground mr-2">#{i + 1}</span>{name}</span>
                                    <span className="font-semibold">{qty}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ Icon, label, value, accent, testid }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-soft" data-testid={testid}>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${accent}`}>
                    <Icon className="w-4 h-4 text-white" />
                </span>
            </div>
            <p className="font-display text-3xl font-extrabold mt-2">{value}</p>
        </div>
    );
}

export function StatusBadge({ status }) {
    const colors = {
        Received: "bg-blue-50 text-blue-700 border-blue-200",
        Accepted: "bg-blue-50 text-blue-700 border-blue-200",
        Preparing: "bg-amber-50 text-amber-700 border-amber-200",
        Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
        "Out For Delivery": "bg-amber-100 text-amber-800 border-amber-300",
        Delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
        Rejected: "bg-brand/10 text-brand border-brand/30",
        Done: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (<span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${colors[status] || colors.Accepted}`} data-testid={`status-badge-${(status || "").toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>);
}
