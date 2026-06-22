import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OrderTracker from "../components/OrderTracker";
import { getOrderById, subscribeOrderById } from "../lib/orders";

export default function OrderStatus() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        let active = true;
        const load = () =>
            getOrderById(id)
                .then((d) => active && setOrder(d))
                .catch(() => {});
        load();
        const unsub = subscribeOrderById(id, () => load());
        return () => {
            active = false;
            unsub();
        };
    }, [id]);

    if (!order) {
        return (
            <div className="min-h-screen bg-cream">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-16" data-testid="status-loading">
                    <div className="bg-white rounded-2xl p-8 border border-warmBeige animate-pulse h-40" />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-10">
                <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand mb-4">
                    <ArrowLeft className="w-4 h-4" /> Continue browsing
                </Link>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-warmBeige shadow-soft mb-6" data-testid="order-status-card">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Order ID</p>
                            <p className="font-display text-2xl" data-testid="status-order-number">{order.order_number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-display text-2xl text-brand">₹{order.total_amount}</p>
                        </div>
                    </div>
                </div>
                <OrderTracker status={order.status} />
            </main>
            <Footer />
        </div>
    );
}
