import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock, Receipt, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrderById, subscribeOrderById } from "../lib/orders";

export default function Confirmation() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        getOrderById(id).then((d) => mounted && setOrder(d)).catch((e) => mounted && setError(e.message));
        const unsub = subscribeOrderById(id, (newRow) => { setOrder((prev) => (prev ? { ...prev, ...newRow } : prev)); });
        return () => { mounted = false; unsub(); };
    }, [id]);

    if (error) return <ErrorView />;
    if (!order) return <LoadingView />;

    const rejected = order.status === "Rejected";
    const accepted = ["Accepted", "Preparing", "Out For Delivery", "Delivered"].includes(order.status);

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-10 md:py-16">
                <div className="bg-white rounded-[28px] p-8 md:p-10 shadow-soft text-center" data-testid="confirmation-card">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${rejected ? "bg-brand/10 text-brand" : "bg-emerald-100 text-emerald-700"}`}>
                        {rejected ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                    </div>
                    {rejected ? (
                        <>
                            <h1 className="font-display text-3xl md:text-4xl font-extrabold">Order Rejected</h1>
                            <p className="text-muted-foreground mt-2">
                                {order.rejection_reason ? `Reason: ${order.rejection_reason}` : "Sorry, we couldn't accept your order this time."}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{accepted ? "Order Accepted!" : "Order Placed!"}</h1>
                            <p className="text-muted-foreground mt-2">{accepted ? "Your order is being prepared 🍕" : "Confirming with the kitchen..."}</p>
                        </>
                    )}

                    <div className="mt-6 grid sm:grid-cols-3 gap-3 text-left">
                        <div className="p-4 rounded-2xl bg-cream">
                            <p className="text-xs text-muted-foreground">Order ID</p>
                            <p className="font-semibold mt-1 break-all" data-testid="confirmation-order-number">{order.order_number}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-cream">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-display text-2xl font-extrabold mt-1">₹{order.total_amount}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-cream flex items-start gap-2">
                            <Clock className="w-4 h-4 text-brand shrink-0 mt-1" />
                            <div>
                                <p className="text-xs text-muted-foreground">{order.mode === "delivery" ? "Will be here in" : "Status"}</p>
                                <p className="font-semibold mt-1">
                                    {order.mode === "delivery" ? `${order.eta_minutes || 30} mins${order.distance_km ? ` · ${order.distance_km} km` : ""}` : (rejected ? "Rejected" : "Being prepared")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-left">
                        <h3 className="font-semibold flex items-center gap-2 mb-3"><Receipt className="w-4 h-4" /> Items</h3>
                        <ul className="space-y-2">
                            {order.order_items?.map((it) => (
                                <li key={it.id} className="flex items-center justify-between text-sm py-2 border-b border-warmBeige last:border-0">
                                    <span>{it.quantity}× {it.item_name}{it.size ? ` (${it.size})` : ""}</span>
                                    <span className="font-semibold">₹{it.price * it.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {!rejected && (
                        <Link to={`/order/${order.id}`} className="mt-6 inline-flex items-center justify-center bg-brand text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-700 transition-all" data-testid="track-order-button">
                            Track my order
                        </Link>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function LoadingView() {
    return (
        <div className="min-h-screen bg-cream">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-20" data-testid="confirmation-loading">
                <div className="bg-white rounded-2xl p-8 animate-pulse h-40" />
            </div>
            <Footer />
        </div>
    );
}
function ErrorView() {
    return (
        <div className="min-h-screen bg-cream">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <p className="font-display text-2xl font-extrabold">Couldn&apos;t load order</p>
            </div>
            <Footer />
        </div>
    );
}
