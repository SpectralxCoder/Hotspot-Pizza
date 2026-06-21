import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "hotspot_cart_v1";

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item) => {
        // item: { id, name, size, price, quantity, image }
        setItems((prev) => {
            const key = `${item.id}__${item.size || "default"}`;
            const idx = prev.findIndex((p) => p.key === key);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: next[idx].quantity + (item.quantity || 1) };
                return next;
            }
            return [...prev, { key, ...item, quantity: item.quantity || 1 }];
        });
    }, []);

    const removeItem = useCallback((key) => {
        setItems((prev) => prev.filter((p) => p.key !== key));
    }, []);

    const updateQuantity = useCallback((key, qty) => {
        setItems((prev) =>
            prev
                .map((p) => (p.key === key ? { ...p, quantity: qty } : p))
                .filter((p) => p.quantity > 0)
        );
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const totals = useMemo(() => {
        const count = items.reduce((s, i) => s + i.quantity, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        return { count, subtotal };
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clear,
                totals,
                isOpen,
                setOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
