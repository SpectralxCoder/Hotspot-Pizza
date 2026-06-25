import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, UtensilsCrossed, Leaf } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import MenuItemCard from "../components/MenuItemCard";
import { listMenuItems, subscribeMenuItems, computePopularity } from "../lib/menuService";
import { MENU as STATIC_MENU } from "../data/menu";
import { useSettings } from "../contexts/SettingsContext";
import { isRestaurantOpen, formatHours } from "../lib/hours";

const SORT_OPTIONS = [
    { id: "popular", label: "Most Popular" },
    { id: "price_asc", label: "Price · Low → High" },
    { id: "price_desc", label: "Price · High → Low" },
    { id: "default", label: "Recommended" },
];

export default function Menu() {
    const [params] = useSearchParams();
    const tableParam = params.get("table");
    const modeParam = params.get("mode");
    const mode = tableParam ? "dine_in" : modeParam === "delivery" ? "delivery" : null;
    const { settings, categories } = useSettings();

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [sortBy, setSortBy] = useState("default");
    const [items, setItems] = useState([]);
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
        } catch { setItems(adaptStatic()); }
        finally { setLoading(false); }
    };

    const loadPopularity = async () => {
        try {
            const popMap = await computePopularity(settings?.popular_mode || "all_time");
            const sorted = [...popMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
            setPopularSet(new Set(sorted.map(([k]) => k)));
        } catch { /* ignore */ }
    };

    useEffect(() => {
        loadMenu();
        loadPopularity();
        const u = subscribeMenuItems(loadMenu);
        return u;
    }, [settings?.popular_mode]);

    const open = isRestaurantOpen(settings);
    const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);
    const TABS = ["All", ...categoryNames];

    const minPriceOf = (it) => Array.isArray(it.sizes) && it.sizes.length ? Math.min(...it.sizes.map((s) => s.price)) : it.price || 0;

    const filtered = useMemo(() => {
        let list = items.filter((m) => {
            if (!query) return true;
            const q = query.toLowerCase();
            return m.name?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
        });
        if (sortBy === "price_asc") list = [...list].sort((a, b) => minPriceOf(a) - minPriceOf(b));
        if (sortBy === "price_desc") list = [...list].sort((a, b) => minPriceOf(b) - minPriceOf(a));
        if (sortBy === "popular") list = [...list].sort((a, b) => Number(popularSet.has((b.name || "").toLowerCase())) - Number(popularSet.has((a.name || "").toLowerCase())));
        return list;
    }, [items, query, sortBy, popularSet]);

    const visibleCategories = useMemo(() => activeTab === "All" ? categoryNames : [activeTab], [activeTab, categoryNames]);

    const groupedByCategory = useMemo(() => {
        const g = {};
        for (const c of categoryNames) g[c] = [];
        for (const it of filtered) {
            if (g[it.category]) g[it.category].push(toMenuShape(it, popularSet.has((it.name || "").toLowerCase()), !open));
        }
        return g;
    }, [filtered, categoryNames, popularSet, open]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab !== "All") {
            requestAnimationFrame(() => {
                const el = sectionRefs.current[tab];
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 120;
                    window.scrollTo({ top, behavior: "smooth" });
                }
            });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Mouse wheel → horizontal scroll for tabs
    const tabRowRef = useRef(null);
    const onWheelTabs = (e) => {
        if (!tabRowRef.current) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            tabRowRef.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            {!open && (
                <div className="bg-brand text-white text-center text-sm font-semibold py-2.5" data-testid="closed-banner">
                    Currently closed · Items unavailable for ordering · Hours: {formatHours(settings)}
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
                        <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <Leaf className="w-3 h-3" /> 100% Pure Veg
                        </span>
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
                    </div>
                </div>

                <div className="relative mt-8 max-w-3xl flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2" />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search burgers, pizzas..."
                            className="w-full pl-14 pr-5 py-4 rounded-full bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-soft" data-testid="menu-search-input" />
                    </div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-4 rounded-full bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-soft"
                        data-testid="menu-sort-select">
                        {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>
            </section>

            <div className="sticky top-16 z-30 bg-cream/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div ref={tabRowRef} onWheel={onWheelTabs} className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
                        {TABS.map((tab) => (
                            <button key={tab} onClick={() => handleTabClick(tab)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 ${
                                    activeTab === tab ? "bg-brand text-white shadow-soft" : "bg-white text-foreground hover:bg-warmBeige/50"
                                }`}
                                style={{ scrollSnapAlign: "start" }}
                                data-testid={`category-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-white rounded-[24px] h-80 animate-pulse" />))}
                    </div>
                ) : (
                    visibleCategories.map((cat) => {
                        const list = groupedByCategory[cat] || [];
                        if (list.length === 0) return null;
                        return (
                            <section key={cat} ref={(el) => (sectionRefs.current[cat] = el)} className="mb-14" data-testid={`category-section-${cat.replace(/\s+/g, "-").toLowerCase()}`}>
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
    return STATIC_MENU.map((m, idx) => ({
        id: m.id, name: m.name, description: m.description, category: m.category,
        price: m.price ?? null, sizes: m.sizes ?? null, image_url: m.image,
        in_stock: true, is_popular: false, sort_order: idx, discount_price: null,
    }));
}

function toMenuShape(row, isPopular, restaurantClosed) {
    return {
        id: row.id, name: row.name, description: row.description || "", category: row.category,
        price: row.price, sizes: row.sizes, image: row.image_url,
        discount_price: row.discount_price,
        in_stock: row.in_stock !== false && !restaurantClosed,
        unavailable_reason: restaurantClosed ? "Restaurant is closed" : (row.in_stock === false ? "Out of stock" : null),
        is_popular: row.is_popular || isPopular, veg: true,
    };
}
