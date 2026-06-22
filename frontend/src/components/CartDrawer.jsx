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
            <div
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setOpen(false)}
                data-testid="cart-backdrop"
            />
            <aside
                className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] bg-cream shadow-drawer transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                } flex flex-col`}
                data-testid="cart-drawer"
                aria-hidden={!isOpen}
            >
                <div className="flex items-center justify-between p-6">
                    <h3 className="font-display text-2xl font-extrabold">Your bag</h3>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 rounded-full hover:bg-warmBeige/60"
                        data-testid="close-cart-button"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-3">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20" data-testid="cart-empty-state">
                            <ShoppingBag className="w-12 h-12 text-brand mb-3" />
                            <p className="font-display text-2xl font-extrabold">Your bag is empty</p>
                            <p className="text-sm text-muted-foreground mt-1">Add a little heat.</p>
                        </div>
                    ) : (
                        items.map((it) => (
                            <div
                                key={it.key}
                                className="flex gap-3 p-3 rounded-2xl bg-white"
                                data-testid={`cart-item-${it.id}`}
                            >
                                <img src={it.image} alt={it.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm leading-tight">{it.name}</p>
                                    {it.size && <p className="text-xs text-muted-foreground">{it.size}</p>}
                                    <p className="text-sm font-extrabold mt-1">₹{it.price}</p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeItem(it.key)}
                                        className="text-xs text-muted-foreground hover:text-brand"
                                        data-testid={`cart-remove-${it.id}`}
                                    >
                                        Remove
                                    </button>
                                    <div className="flex items-center gap-1 bg-cream rounded-full">
                                        <button
                                            onClick={() => updateQuantity(it.key, it.quantity - 1)}
                                            className="p-1.5 hover:text-brand"
                                            data-testid={`cart-decrease-${it.id}`}
                                            aria-label="Decrease"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-bold w-6 text-center" data-testid={`cart-qty-${it.id}`}>{it.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(it.key, it.quantity + 1)}
                                            className="p-1.5 hover:text-brand"
                                            data-testid={`cart-increase-${it.id}`}
                                            aria-label="Increase"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 space-y-3 bg-white rounded-t-[28px]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="font-display text-3xl font-extrabold" data-testid="cart-subtotal">₹{totals.subtotal}</span>
                    </div>
                    <button
                        disabled={items.length === 0}
                        onClick={goCheckout}
                        className="w-full bg-brand text-white py-3.5 rounded-full font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="checkout-button"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </aside>
        </>
    );
}
