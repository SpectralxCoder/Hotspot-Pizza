import React from "react";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
    const { items, isOpen, setOpen, updateQuantity, removeItem, totals } = useCart();
    const navigate = useNavigate();

    const goCheckout = () => {
        setOpen(false);
        navigate("/checkout");
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setOpen(false)}
                data-testid="cart-backdrop"
            />
            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-drawer transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                } flex flex-col`}
                data-testid="cart-drawer"
                aria-hidden={!isOpen}
            >
                <div className="flex items-center justify-between p-5 border-b border-warmBorder">
                    <h3 className="font-display text-2xl">Your Cart</h3>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-full hover:bg-cream"
                        data-testid="close-cart-button"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20" data-testid="cart-empty-state">
                            <ShoppingBag className="w-12 h-12 text-warmOrange mb-3" />
                            <p className="font-display text-xl">Your cart is empty</p>
                            <p className="text-sm text-muted-foreground mt-1">Add a slice of happiness!</p>
                        </div>
                    ) : (
                        items.map((it) => (
                            <div
                                key={it.key}
                                className="flex gap-3 p-3 rounded-2xl border border-warmBorder bg-white"
                                data-testid={`cart-item-${it.id}`}
                            >
                                <img src={it.image} alt={it.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm leading-tight">{it.name}</p>
                                    {it.size && <p className="text-xs text-muted-foreground">{it.size}</p>}
                                    <p className="text-sm font-semibold text-brand mt-1">₹{it.price}</p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeItem(it.key)}
                                        className="text-xs text-muted-foreground hover:text-brand"
                                        data-testid={`cart-remove-${it.id}`}
                                    >
                                        Remove
                                    </button>
                                    <div className="flex items-center gap-1 border border-warmBorder rounded-full">
                                        <button
                                            onClick={() => updateQuantity(it.key, it.quantity - 1)}
                                            className="p-1.5 hover:text-brand"
                                            data-testid={`cart-decrease-${it.id}`}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm w-6 text-center" data-testid={`cart-qty-${it.id}`}>{it.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(it.key, it.quantity + 1)}
                                            className="p-1.5 hover:text-brand"
                                            data-testid={`cart-increase-${it.id}`}
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t border-warmBorder p-5 space-y-3 bg-cream">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="font-display text-2xl" data-testid="cart-subtotal">₹{totals.subtotal}</span>
                    </div>
                    <button
                        disabled={items.length === 0}
                        onClick={goCheckout}
                        className="w-full bg-brand text-white py-3 rounded-full font-medium hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="checkout-button"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </aside>
        </>
    );
}
