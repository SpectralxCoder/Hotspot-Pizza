import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Flame } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useSettings } from "../contexts/SettingsContext";

export default function Navbar() {
    const { totals, setOpen } = useCart();
    const { settings } = useSettings();
    const shopName = settings?.shop_name || "Hotspot";
    const location = useLocation();
    const onMenu = location.pathname.startsWith("/menu");

    return (
        <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur" data-testid="customer-navbar">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand text-white shadow-soft">
                        <Flame className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <span className="font-display text-2xl font-extrabold tracking-tight">{shopName}</span>
                </Link>

                <nav className="hidden md:flex items-center gap-10 text-base font-medium">
                    <Link to="/" className="hover:text-brand transition-colors" data-testid="nav-home">Home</Link>
                    <Link to="/menu" className={`hover:text-brand transition-colors ${onMenu ? "text-brand" : ""}`} data-testid="nav-menu">Menu</Link>
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-warmBeige/60 transition-colors"
                        data-testid="open-cart-button"
                        aria-label="Open cart"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {totals.count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count-badge">
                                {totals.count}
                            </span>
                        )}
                    </button>
                    <Link
                        to="/admin/login"
                        className="hidden md:inline-flex items-center bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-all"
                        data-testid="nav-admin"
                    >
                        Admin
                    </Link>
                </div>
            </div>
        </header>
    );
}
