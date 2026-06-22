import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listArchive, subscribeArchive } from "../lib/orders";

export default function AdminArchive() {
    const [archive, setArchive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const load = async () => {
        try {
            const data = await listArchive();
            setArchive(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const unsub = subscribeArchive(load);
        return unsub;
    }, []);

    const filtered = useMemo(() => {
        if (!filter) return archive;
        const f = filter.toLowerCase();
        return archive.filter((a) => {
            const d = a.order_data || {};
            return (
                (a.customer_name || "").toLowerCase().includes(f) ||
                (d.order_number || "").toLowerCase().includes(f) ||
                new Date(a.completed_at).toLocaleDateString().includes(f)
            );
        });
    }, [filter, archive]);

    return (
        <div className="space-y-6" data-testid="admin-archive-page">
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl">Archive</h1>
                    <p className="text-sm text-muted-foreground">Completed orders for your records.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search by name, order or date..."
                        className="pl-9 pr-4 py-2 rounded-full border border-warmBeige bg-white text-sm focus:outline-none focus:border-brand w-64"
                        data-testid="archive-search"
                    />
                </div>
            </div>
            <SetupNotice />

            {loading ? (
                <div className="bg-white rounded-2xl p-8 border border-warmBeige animate-pulse h-40" />
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-warmBeige text-center" data-testid="archive-empty">
                    <p className="font-display text-2xl">No archived orders</p>
                    <p className="text-sm text-muted-foreground mt-1">Marked-done orders will be moved here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-warmBeige shadow-soft overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-cream text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Order ID</th>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium">Items</th>
                                <th className="px-4 py-3 font-medium">Amount</th>
                                <th className="px-4 py-3 font-medium">Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((a) => {
                                const d = a.order_data || {};
                                const items = d.order_items || [];
                                return (
                                    <tr key={a.id} className="border-t border-warmBeige" data-testid={`archive-row-${a.id}`}>
                                        <td className="px-4 py-3 font-medium">{d.order_number || "—"}</td>
                                        <td className="px-4 py-3">{a.customer_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {items.map((it) => `${it.quantity}× ${it.item_name}${it.size ? ` (${it.size})` : ""}`).join(", ")}
                                        </td>
                                        <td className="px-4 py-3 font-medium">₹{d.total_amount || 0}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(a.completed_at).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
