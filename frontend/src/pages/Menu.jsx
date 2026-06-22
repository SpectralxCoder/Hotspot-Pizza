import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, UtensilsCrossed, LogIn, LogOut, User, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import MenuItemCard from "../components/MenuItemCard";
import { listMenuItems, subscribeMenuItems, getSettings, subscribeSettings, computePopularity } from "../lib/menuService";
import { CATEGORIES, MENU as STATIC_MENU } from "../data/menu";
import { useUserAuth } from "../contexts/UserAuthContext";
import { isRestaurantOpen, formatHours } from "../lib/hours";
import { toast } from "sonner";

const TABS = ["All", ...CATEGORIES];

export default function Menu() {
    const [params] = useSearchParams();
    const tableParam = params.get("table");
    const modeParam = params.get("mode");
    const mode = tableParam ? "dine_in" : modeParam === "delivery" ? "delivery" : null;
    const navigate = useNavigate();
    const { user, signOut } = useUserAuth();

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [items, setItems] = useState([]);
    const [settings, setSettings] = useState(null);
    const [popularSet, setPopularSet] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const sectionRefs = useRef({});

    useEffect(() => {
        if (tableParam) {
            sessionStorage.setItem("hotspot_order_mode", "dine_in");
            sessionStorage.setItem("hotspot_table_number", tableParam);
        } else if (modeParam === "delivery") {
            sessionStorage.setItem("hotspot_order_mode", "delivery");
            sessionStorage.removeItem("hotspot_table_number");
        }
    }, [tableParam, modeParam]);

    const loadMenu = async () => {
        try {
            const data = await listMenuItems();
            setItems(data.length ? data : adaptStatic());
        } catch {
            setItems(adaptStatic());
        } finally {
            setLoading(false);
        }
    };

    const loadSettings = async () => {
        try {
            const s = await getSettings();
            setSettings(s);
        } catch { /* ignore */ }
    };

    const loadPopularity = async () => {
        try {
            const s = await getSettings();
            const popMap = await computePopularity(s?.popular_mode || "all_time");
            const sorted = [...popMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
            setPopularSet(new Set(sorted.map(([k]) => k)));
        } catch { /* ignore */ }
    };

    useEffect(() => {
        loadMenu();
        loadSettings();
        loadPopularity();
        const u1 = subscribeMenuItems(loadMenu);
        const u2 = subscribeSettings(loadSettings);
        return () => { u1?.(); u2?.(); };
    }, []);

    const open = isRestaurantOpen(settings);

    const filtered = useMemo(() => {
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter((m) => m.name?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q));
    }, [items, query]);

    const visibleCategories = useMemo(() => (activeTab === "All" ? CATEGORIES : [activeTab]), [activeTab]);

    const groupedByCategory = useMemo(() => {
        const g = {};
        for (const c of CATEGORIES) g[c] = [];
        for (const it of filtered) {
            if (g[it.category]) g[it.category].push(toMenuShape(it, popularSet.has((it.name || "").toLowerCase())));
        }
        return g;
    }, [filtered, popularSet]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab !== "All") {
            requestAnimationFrame(() => {
                const el = sectionRefs.current[tab];
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: "smooth" });
                }
            });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            {!open && (
                <div className="bg-brand text-white text-center text-sm font-semibold py-2.5" data-testid="closed-banner">
                    Restaurant is currently closed. Hours: {formatHours(settings)}
                </div>
            )}

            <section className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-12">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <p className="eyebrow">Order Online</p>
                        <h1 className="font-display text-5xl md:text-6xl font-extrabold mt-3">The Menu.</h1>
                        <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-md">
                            Pick your weapon. We&apos;ll fire it up and get it to you faster than your delivery app can refresh.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {mode === "dine_in" && (
                            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold" data-testid="mode-badge-dinein">
                                <UtensilsCrossed className="w-3.5 h-3.5" /> Dine-in · Table {tableParam}
                            </span>
                        )}
                        {mode === "delivery" && (
                            <span className="inline-flex items-center gap-2 bg-brand/10 text-brand border border-brand/30 px-3 py-1.5 rounded-full text-xs font-semibold" data-testid="mode-badge-delivery">
                                <MapPin className="w-3.5 h-3.5" /> Home Delivery
                            </span>
                        )}
                        {user ? (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {user.email || user.phone}</span>
                                <button onClick={async () => { await signOut(); toast.success("Signed out"); }} className="text-muted-foreground hover:text-brand inline-flex items-center gap-1" data-testid="signout-button">
                                    <LogOut className="w-3 h-3" /> Sign out
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => navigate("/auth/login")} className="text-xs text-brand font-semibold inline-flex items-center gap-1" data-testid="user-signin-link">
                                <LogIn className="w-3.5 h-3.5" /> Sign in to track orders
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative mt-8 max-w-3xl">
                    <Search className="w-5 h-5 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search burgers, pizzas, wings..."
                        className="w-full pl-14 pr-5 py-4 rounded-full bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-soft"
                        data-testid="menu-search-input"
                    />
                </div>
            </section>

            <div className="sticky top-16 z-30 bg-cream/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                                    activeTab === tab ? "bg-brand text-white shadow-soft" : "bg-white text-foreground hover:bg-warmBeige/50"
                                }`}
                                data-testid={`category-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[24px] h-80 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    visibleCategories.map((cat) => {
                        const list = groupedByCategory[cat] || [];
                        if (list.length === 0) return null;
                        return (
                            <section
                                key={cat}
                                ref={(el) => (sectionRefs.current[cat] = el)}
                                className="mb-14"
                                data-testid={`category-section-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                            >
                                {activeTab === "All" && (
                                    <div className="flex items-end gap-3 mb-6">
                                        <h2 className="font-display text-3xl md:text-4xl font-extrabold">{cat}</h2>
                                        <span className="text-sm text-muted-foreground pb-1">{list.length} items</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {list.map((it) => (<MenuItemCard key={it.id} item={it} />))}
                                </div>
                            </section>
                        );
                    })
                )}
                {!loading && filtered.length === 0 && (
                    <div className="py-24 text-center" data-testid="menu-empty">
                        <p className="font-display text-3xl font-extrabold">No items found</p>
                        <p className="text-sm text-muted-foreground mt-2">Try a different search.</p>
                    </div>
                )}
            </main>

            <Footer />
            <CartDrawer />
        </div>
    );
}

function adaptStatic() {
    // Fallback when menu_items table is empty — adapt static menu shape to DB shape
    return STATIC_MENU.map((m, idx) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        category: m.category,
        price: m.price ?? null,
        sizes: m.sizes ?? null,
        image_url: m.image,
        in_stock: true,
        is_popular: false,
        sort_order: idx,
    }));
}

function toMenuShape(row, isPopular) {
    return {
        id: row.id,
        name: row.name,
        description: row.description || "",
        category: row.category,
        price: row.price,
        sizes: row.sizes,
        image: row.image_url,
        in_stock: row.in_stock !== false,
        is_popular: row.is_popular || isPopular,
        veg: true,
    };
}
