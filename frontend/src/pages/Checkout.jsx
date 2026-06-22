import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, UtensilsCrossed, IndianRupee, Wallet } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SetupNotice from "../components/SetupNotice";
import { useCart } from "../contexts/CartContext";
import { placeOrder } from "../lib/orders";
import { isSupabaseConfigured } from "../lib/supabase";
import { toast } from "sonner";

export default function Checkout() {
    const { items, totals, clear } = useCart();
    const navigate = useNavigate();
    const [mode, setMode] = useState("delivery");
    const [tableNumber, setTableNumber] = useState("");
    const [form, setForm] = useState({ name: "", phone: "", address: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const m = sessionStorage.getItem("hotspot_order_mode");
        const t = sessionStorage.getItem("hotspot_table_number");
        if (m === "dine_in") {
            setMode("dine_in");
            if (t) setTableNumber(t);
        } else if (m === "delivery") {
            setMode("delivery");
        }
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            // Don't redirect immediately to allow refresh from confirmation
        }
    }, [items.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSupabaseConfigured) {
            toast.error("Supabase is not configured. Please set up the database first.");
            return;
        }
        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        if (!form.name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (mode === "delivery" && (!form.phone.trim() || !form.address.trim())) {
            toast.error("Phone & address required for delivery");
            return;
        }
        if (mode === "dine_in" && !tableNumber) {
            toast.error("Table number missing — please scan the QR again");
            return;
        }

        setSubmitting(true);
        try {
            const order = await placeOrder({
                customer_name: form.name.trim(),
                phone: mode === "delivery" ? form.phone.trim() : null,
                address: mode === "delivery" ? form.address.trim() : null,
                table_number: mode === "dine_in" ? Number(tableNumber) : null,
                mode,
                items: items.map((i) => ({
                    name: i.name,
                    size: i.size,
                    quantity: i.quantity,
                    price: i.price,
                })),
                total_amount: totals.subtotal,
            });
            clear();
            navigate(`/order/${order.id}/confirmation`);
        } catch (err) {
            console.error(err);
            toast.error(err?.message || "Failed to place order. Did you run the SQL schema?");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-muted-foreground hover:text-brand inline-flex items-center gap-1.5 mb-6"
                    data-testid="checkout-back"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to menu
                </button>

                <SetupNotice />

                <div className="grid md:grid-cols-3 gap-8 mt-4">
                    <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-[28px] p-6 md:p-8 shadow-soft" data-testid="checkout-form">
                        <h1 className="font-display text-4xl font-extrabold mb-2">Checkout</h1>
                        <p className="text-sm text-muted-foreground mb-6">Tell us where you&apos;d like your slice of happiness.</p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setMode("dine_in")}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                    mode === "dine_in" ? "border-brand bg-brand/5" : "border-warmBeige hover:border-brand/40"
                                }`}
                                data-testid="mode-dinein-button"
                            >
                                <UtensilsCrossed className="w-5 h-5 mb-2 text-brand" />
                                <p className="font-medium text-sm">Dine-in</p>
                                <p className="text-xs text-muted-foreground">Eat at the restaurant</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("delivery")}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                    mode === "delivery" ? "border-brand bg-brand/5" : "border-warmBeige hover:border-brand/40"
                                }`}
                                data-testid="mode-delivery-button"
                            >
                                <MapPin className="w-5 h-5 mb-2 text-brand" />
                                <p className="font-medium text-sm">Home Delivery</p>
                                <p className="text-xs text-muted-foreground">Delivered hot</p>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Your full name"
                                    className="mt-1 w-full px-4 py-3 rounded-2xl border border-warmBeige bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    data-testid="input-name"
                                    required
                                />
                            </div>

                            {mode === "dine_in" ? (
                                <div>
                                    <label className="text-sm font-medium" htmlFor="table">Table Number</label>
                                    <input
                                        id="table"
                                        type="number"
                                        min="1"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        placeholder="Table number"
                                        className="mt-1 w-full px-4 py-3 rounded-2xl border border-warmBeige bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                        data-testid="input-table"
                                        required
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm font-medium" htmlFor="phone">Phone Number</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="10-digit mobile number"
                                            className="mt-1 w-full px-4 py-3 rounded-2xl border border-warmBeige bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                            data-testid="input-phone"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium" htmlFor="address">Delivery Address</label>
                                        <textarea
                                            id="address"
                                            rows={3}
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            placeholder="House no, street, locality, landmark, city"
                                            className="mt-1 w-full px-4 py-3 rounded-2xl border border-warmBeige bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                            data-testid="input-address"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-2 p-3 bg-cream rounded-2xl border border-warmBeige">
                                <Wallet className="w-5 h-5 text-brand" />
                                <p className="text-sm">Payment: <span className="font-medium">Pay on Delivery</span></p>
                            </div>
                        </div>

                            <button
                                type="submit"
                                disabled={submitting || items.length === 0}
                                className="mt-6 w-full bg-brand text-white py-4 rounded-full font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                data-testid="place-order-button"
                        >
                            {submitting ? "Placing order..." : `Place Order — ₹${totals.subtotal}`}
                        </button>
                    </form>

                    <aside className="bg-white rounded-[28px] p-6 shadow-soft h-fit" data-testid="checkout-summary">
                        <h3 className="font-display text-xl font-extrabold mb-4">Order summary</h3>
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                        ) : (
                            <ul className="space-y-3 mb-4">
                                {items.map((it) => (
                                    <li key={it.key} className="flex items-start gap-3 text-sm">
                                        <span className="w-6 text-muted-foreground">{it.quantity}×</span>
                                        <div className="flex-1">
                                            <p className="font-medium leading-tight">{it.name}</p>
                                            {it.size && <p className="text-xs text-muted-foreground">{it.size}</p>}
                                        </div>
                                        <span className="font-medium">₹{it.price * it.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="border-t border-warmBeige pt-3 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="font-display text-2xl font-extrabold text-foreground inline-flex items-center"><IndianRupee className="w-5 h-5" />{totals.subtotal}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">Estimated time: 20–30 minutes</p>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}
