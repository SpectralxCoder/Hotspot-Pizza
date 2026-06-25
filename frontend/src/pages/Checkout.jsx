import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, UtensilsCrossed, IndianRupee, Wallet, Clock, Lock, Truck, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SetupNotice from "../components/SetupNotice";
import MapPicker from "../components/MapPicker";
import { useCart } from "../contexts/CartContext";
import { useSettings } from "../contexts/SettingsContext";
import { placeOrder } from "../lib/orders";
import { isSupabaseConfigured } from "../lib/supabase";
import { calculateEta, distanceKm, restaurantLocationFromSettings, isRestaurantOpen, formatHours, FREE_DELIVERY_MIN_ORDER, FREE_DELIVERY_RADIUS_KM } from "../lib/hours";
import { toast } from "sonner";

export default function Checkout() {
    const { items, totals, clear } = useCart();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const numTables = settings?.num_tables || 20;
    const restaurantLoc = restaurantLocationFromSettings(settings);
    const open = isRestaurantOpen(settings);

    const [mode, setMode] = useState("delivery");
    const [tableNumber, setTableNumber] = useState("");
    const [tableLocked, setTableLocked] = useState(false);
    const [modeLocked, setModeLocked] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", address: "" });
    const [location, setLocation] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const m = sessionStorage.getItem("hotspot_order_mode");
        const t = sessionStorage.getItem("hotspot_table_number");
        if (m === "dine_in") {
            setMode("dine_in");
            setModeLocked(true);
            if (t) {
                // Validate table within range
                const tn = Number(t);
                if (!tn || tn < 1 || tn > numTables) {
                    toast.error(`Invalid table number ${t}. Redirecting...`);
                    sessionStorage.removeItem("hotspot_table_number");
                    sessionStorage.removeItem("hotspot_order_mode");
                    navigate("/", { replace: true });
                    return;
                }
                setTableNumber(t);
                setTableLocked(true);
            }
        } else if (m === "delivery") {
            setMode("delivery");
            setModeLocked(true);
        }
    }, [numTables, navigate]);

    const distance = mode === "delivery" && location ? distanceKm(restaurantLoc, location) : null;
    const eta = mode === "delivery" ? calculateEta({ distanceKm: distance || 5 }) : null;
    const inFreeRadius = distance != null && distance <= FREE_DELIVERY_RADIUS_KM;
    const meetsMinOrder = totals.subtotal >= FREE_DELIVERY_MIN_ORDER;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSupabaseConfigured) return toast.error("Supabase is not configured.");
        if (!open) return toast.error("We are currently closed.");
        if (items.length === 0) return toast.error("Your cart is empty");
        if (!form.name.trim()) return toast.error("Please enter your name");
        if (mode === "delivery") {
            if (totals.subtotal < FREE_DELIVERY_MIN_ORDER)
                return toast.error(`Minimum order for delivery is ₹${FREE_DELIVERY_MIN_ORDER}`);
            if (!form.phone.trim() || !form.address.trim())
                return toast.error("Phone & address required for delivery");
            if (!location) return toast.error("Please pick your location on the map");
            if (distance != null && distance > FREE_DELIVERY_RADIUS_KM)
                return toast.error(`Sorry, we only deliver within ${FREE_DELIVERY_RADIUS_KM} km. You're ${distance} km away.`);
        }
        if (mode === "dine_in") {
            const t = Number(tableNumber);
            if (!t || t < 1 || t > numTables) return toast.error(`Table number must be between 1 and ${numTables}`);
        }

        setSubmitting(true);
        try {
            const order = await placeOrder({
                customer_name: form.name.trim(),
                phone: mode === "delivery" ? form.phone.trim() : null,
                address: mode === "delivery" ? form.address.trim() : null,
                table_number: mode === "dine_in" ? Number(tableNumber) : null,
                mode,
                items: items.map((i) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
                total_amount: totals.subtotal,
                latitude: location?.lat ?? null,
                longitude: location?.lng ?? null,
                distance_km: distance,
                eta_minutes: eta,
                location_label: location?.label ?? null,
                is_open: open,
            });
            clear();
            navigate(`/order/${order.id}/confirmation`);
        } catch (err) {
            console.error(err);
            toast.error(err?.message || "Failed to place order");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
                <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-brand inline-flex items-center gap-1.5 mb-6" data-testid="checkout-back">
                    <ArrowLeft className="w-4 h-4" /> Back to menu
                </button>

                <SetupNotice />

                {!open && (
                    <div className="mb-6 bg-brand text-white rounded-2xl p-4 text-sm" data-testid="closed-notice">
                        We&apos;re currently closed. {formatHours(settings)}.
                    </div>
                )}

                {mode === "delivery" && (
                    <div className={`mb-6 rounded-2xl p-4 text-sm flex items-start gap-3 ${meetsMinOrder ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`} data-testid="delivery-info">
                        <Truck className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Free delivery within {FREE_DELIVERY_RADIUS_KM} km · Min order ₹{FREE_DELIVERY_MIN_ORDER}</p>
                            {!meetsMinOrder && <p className="text-xs mt-0.5">Add ₹{FREE_DELIVERY_MIN_ORDER - totals.subtotal} more to qualify.</p>}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8 mt-4">
                    <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-[28px] p-6 md:p-8 shadow-soft" data-testid="checkout-form">
                        <h1 className="font-display text-4xl font-extrabold mb-2">Checkout</h1>
                        <p className="text-sm text-muted-foreground mb-6">Confirm your order details.</p>

                        {!modeLocked && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button type="button" onClick={() => setMode("dine_in")} className={`p-4 rounded-2xl border-2 text-left transition-all ${mode === "dine_in" ? "border-brand bg-brand/5" : "border-warmBeige hover:border-brand/40"}`} data-testid="mode-dinein-button">
                                    <UtensilsCrossed className="w-5 h-5 mb-2 text-brand" />
                                    <p className="font-semibold text-sm">Dine-in</p>
                                </button>
                                <button type="button" onClick={() => setMode("delivery")} className={`p-4 rounded-2xl border-2 text-left transition-all ${mode === "delivery" ? "border-brand bg-brand/5" : "border-warmBeige hover:border-brand/40"}`} data-testid="mode-delivery-button">
                                    <MapPin className="w-5 h-5 mb-2 text-brand" />
                                    <p className="font-semibold text-sm">Home Delivery</p>
                                </button>
                            </div>
                        )}
                        {modeLocked && (
                            <div className="mb-6 inline-flex items-center gap-2 bg-cream px-4 py-2.5 rounded-full text-sm" data-testid="locked-mode-badge">
                                <Lock className="w-3.5 h-3.5 text-brand" />
                                {mode === "dine_in" ? "Dine-in (scanned table QR)" : "Home delivery (scanned delivery QR)"}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold" htmlFor="name">Full Name</label>
                                <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name"
                                    className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="input-name" required />
                            </div>

                            {mode === "dine_in" ? (
                                <div>
                                    <label className="text-sm font-semibold inline-flex items-center gap-1.5" htmlFor="table">
                                        Table Number {tableLocked && <Lock className="w-3 h-3 text-brand" />}
                                    </label>
                                    <input id="table" type="number" min="1" max={numTables} value={tableNumber}
                                        onChange={(e) => !tableLocked && setTableNumber(e.target.value)}
                                        readOnly={tableLocked}
                                        placeholder={`1 to ${numTables}`}
                                        className={`mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30 ${tableLocked ? "cursor-not-allowed opacity-90" : ""}`}
                                        data-testid="input-table" />
                                    {tableLocked && <p className="text-xs text-muted-foreground mt-1">Locked from your table&apos;s QR.</p>}
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm font-semibold" htmlFor="phone">Phone Number</label>
                                        <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile"
                                            className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="input-phone" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold" htmlFor="address">Delivery Address</label>
                                        <textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House no, street, locality, landmark"
                                            className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="input-address" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold">Pin location on map</label>
                                        <div className="mt-2"><MapPicker value={location} onChange={setLocation} /></div>
                                        {distance != null && !inFreeRadius && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-brand/10 text-brand px-3 py-1.5 rounded-full font-semibold" data-testid="out-of-radius">
                                                <AlertTriangle className="w-3.5 h-3.5" /> {distance} km — outside our {FREE_DELIVERY_RADIUS_KM} km delivery zone
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-2 p-3 bg-cream rounded-2xl">
                                <Wallet className="w-5 h-5 text-brand" />
                                <p className="text-sm">Payment: <span className="font-semibold">Pay on Delivery</span></p>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting || items.length === 0 || !open}
                            className="mt-6 w-full bg-brand text-white py-4 rounded-full font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            data-testid="place-order-button">
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
                                            <p className="font-semibold leading-tight">{it.name}</p>
                                            {it.size && <p className="text-xs text-muted-foreground">{it.size}</p>}
                                        </div>
                                        <span className="font-semibold">₹{it.price * it.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="border-t border-warmBeige pt-3 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="font-display text-2xl font-extrabold inline-flex items-center"><IndianRupee className="w-5 h-5" />{totals.subtotal}</span>
                        </div>
                        {mode === "delivery" && eta && (
                            <div className="mt-3 flex items-center gap-2 text-sm" data-testid="eta-display">
                                <Clock className="w-4 h-4 text-brand" />
                                <span>Your order will be here in <span className="font-bold">{eta} mins</span>{distance ? ` (${distance} km)` : ""}</span>
                            </div>
                        )}
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}
