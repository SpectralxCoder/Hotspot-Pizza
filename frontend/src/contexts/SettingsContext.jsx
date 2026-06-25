// Global shared settings + categories context (so Landing footer, Menu, Checkout all stay in sync)
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSettings, subscribeSettings, listCategories, subscribeCategories } from "../lib/menuService";

const SettingsContext = createContext(null);

const DEFAULT_CATEGORIES = [
    { id: "c0", name: "Combos", sort_order: 0 },
    { id: "c1", name: "Snacks", sort_order: 1 },
    { id: "c2", name: "Desserts", sort_order: 2 },
    { id: "c3", name: "Garlic Bread", sort_order: 3 },
    { id: "c4", name: "Shakes", sort_order: 4 },
    { id: "c5", name: "Simple Veg Pizza", sort_order: 5 },
    { id: "c6", name: "Veg Special", sort_order: 6 },
    { id: "c7", name: "Veg Treat", sort_order: 7 },
    { id: "c8", name: "Feast Special", sort_order: 8 },
    { id: "c9", name: "Hot Pizza Special", sort_order: 9 },
    { id: "c10", name: "Burgers", sort_order: 10 },
];

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(null);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

    const loadSettings = useCallback(async () => {
        try { setSettings(await getSettings()); } catch { /* ignore */ }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const data = await listCategories();
            if (data && data.length) setCategories(data);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        loadSettings();
        loadCategories();
        const u1 = subscribeSettings(loadSettings);
        const u2 = subscribeCategories(loadCategories);
        return () => { u1?.(); u2?.(); };
    }, [loadSettings, loadCategories]);

    return (
        <SettingsContext.Provider value={{ settings, categories, refresh: loadSettings, refreshCategories: loadCategories }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}
