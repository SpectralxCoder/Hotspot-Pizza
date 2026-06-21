import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Pizza } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
    const { totals, setOpen } = useCart();
    const location = useLocation();
    const onMenu = location.pathname.startsWith("/menu");

    return (
        <header
            className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-warmBorder"
            data-testid="customer-navbar"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand text-white shadow-soft">
                        <Pizza className="w-5 h-5" />
                    </span>
                    <span className="font-display text-xl tracking-tight">
                        Hot Spot <span className="text-brand">Pizza</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link to="/" className="hover:text-brand transition-colors" data-testid="nav-home">Home</Link>
                    <Link to="/menu" className={`hover:text-brand transition-colors ${onMenu ? "text-brand" : ""}`} data-testid="nav-menu">Menu</Link>
                    <Link to="/admin/login" className="hover:text-brand transition-colors" data-testid="nav-admin">Admin</Link>
                </nav>

                <button
                    onClick={() => setOpen(true)}
                    className="relative inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 active:scale-95 transition-all shadow-soft"
                    data-testid="open-cart-button"
                    aria-label="Open cart"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Cart</span>
                    {totals.count > 0 && (
                        <span
                            className="absolute -top-2 -right-2 bg-white text-brand text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-brand"
                            data-testid="cart-count-badge"
                        >
                            {totals.count}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
