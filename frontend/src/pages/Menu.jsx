import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, UtensilsCrossed } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import MenuItemCard from "../components/MenuItemCard";
import { CATEGORIES, MENU, searchMenu } from "../data/menu";

const TABS = ["All", ...CATEGORIES];

export default function Menu() {
    const [params] = useSearchParams();
    const tableParam = params.get("table");
    const modeParam = params.get("mode");
    const mode = tableParam ? "dine_in" : modeParam === "delivery" ? "delivery" : null;

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
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

    const filtered = useMemo(() => searchMenu(query), [query]);

    const visibleCategories = useMemo(() => {
        if (activeTab === "All") return CATEGORIES;
        return [activeTab];
    }, [activeTab]);

    const groupedByCategory = useMemo(() => {
        const groups = {};
        for (const c of CATEGORIES) groups[c] = [];
        for (const item of filtered) {
            if (groups[item.category]) groups[item.category].push(item);
        }
        return groups;
    }, [filtered]);

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

            {/* Header */}
            <section className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-12">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <p className="eyebrow">Order Online</p>
                        <h1 className="font-display text-5xl md:text-6xl font-extrabold mt-3">The Menu.</h1>
                        <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-md">
                            Pick your weapon. We&apos;ll fire it up and get it to you faster than your delivery app can refresh.
                        </p>
                    </div>
                    {mode === "dine_in" && (
                        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold" data-testid="mode-badge-dinein">
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            Dine-in · Table {tableParam}
                        </span>
                    )}
                    {mode === "delivery" && (
                        <span className="inline-flex items-center gap-2 bg-brand/10 text-brand border border-brand/30 px-3 py-1.5 rounded-full text-xs font-semibold" data-testid="mode-badge-delivery">
                            <MapPin className="w-3.5 h-3.5" />
                            Home Delivery
                        </span>
                    )}
                </div>

                {/* Search */}
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

            {/* Pill tabs */}
            <div className="sticky top-16 z-30 bg-cream/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                                    activeTab === tab
                                        ? "bg-brand text-white shadow-soft"
                                        : "bg-white text-foreground hover:bg-warmBeige/50"
                                }`}
                                data-testid={`category-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sections */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12">
                {visibleCategories.map((cat) => {
                    const items = groupedByCategory[cat] || [];
                    if (items.length === 0) return null;
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
                                    <span className="text-sm text-muted-foreground pb-1">{items.length} items</span>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {items.map((it) => (
                                    <MenuItemCard key={it.id} item={it} />
                                ))}
                            </div>
                        </section>
                    );
                })}

                {filtered.length === 0 && (
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
