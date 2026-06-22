import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock, Receipt } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OrderTracker from "../components/OrderTracker";
import { getOrderById, subscribeOrderById } from "../lib/orders";

export default function Confirmation() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        getOrderById(id)
            .then((data) => mounted && setOrder(data))
            .catch((e) => mounted && setError(e.message));
        const unsub = subscribeOrderById(id, (newRow) => {
            setOrder((prev) => (prev ? { ...prev, ...newRow } : prev));
        });
        return () => {
            mounted = false;
            unsub();
        };
    }, [id]);

    if (error) {
        return (
            <div className="min-h-screen bg-cream">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                    <p className="font-display text-2xl">Couldn&apos;t load order</p>
                    <p className="text-sm text-muted-foreground mt-2">{error}</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-cream">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-20" data-testid="confirmation-loading">
                    <div className="bg-white rounded-2xl p-8 border border-warmBeige animate-pulse">
                        <div className="h-8 bg-cream rounded w-1/3 mb-4" />
                        <div className="h-4 bg-cream rounded w-1/2" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-10 md:py-16">
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-warmBeige shadow-soft text-center" data-testid="confirmation-card">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl">Order Placed!</h1>
                    <p className="text-muted-foreground mt-2">Your order is being prepared! 🍕</p>

                    <div className="mt-6 grid sm:grid-cols-3 gap-3 text-left">
                        <div className="p-4 rounded-2xl bg-cream border border-warmBeige">
                            <p className="text-xs text-muted-foreground">Order ID</p>
                            <p className="font-medium mt-1 break-all" data-testid="confirmation-order-number">{order.order_number}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-cream border border-warmBeige">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-display text-2xl text-brand mt-1">₹{order.total_amount}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-cream border border-warmBeige flex items-start gap-2">
                            <Clock className="w-4 h-4 text-brand shrink-0 mt-1" />
                            <div>
                                <p className="text-xs text-muted-foreground">{order.mode === "delivery" ? "Estimated delivery" : "Status"}</p>
                                <p className="font-medium mt-1">
                                    {order.mode === "delivery"
                                        ? `${order.eta_minutes || 30} mins${order.distance_km ? ` · ${order.distance_km} km` : ""}`
                                        : "Being prepared at counter"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-left">
                        <h3 className="font-medium flex items-center gap-2 mb-3"><Receipt className="w-4 h-4" /> Items</h3>
                        <ul className="space-y-2">
                            {order.order_items?.map((it) => (
                                <li key={it.id} className="flex items-center justify-between text-sm py-2 border-b border-warmBeige last:border-0">
                                    <span>{it.quantity}× {it.item_name}{it.size ? ` (${it.size})` : ""}</span>
                                    <span className="font-medium">₹{it.price * it.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link
                        to={`/order/${order.id}`}
                        className="mt-6 inline-flex items-center justify-center bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition-all"
                        data-testid="track-order-button"
                    >
                        Track my order
                    </Link>
                </div>

                <div className="mt-8">
                    <OrderTracker status={order.status} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
