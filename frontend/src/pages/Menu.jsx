import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, UtensilsCrossed } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import MenuItemCard from "../components/MenuItemCard";
import { CATEGORIES, MENU, searchMenu } from "../data/menu";

export default function Menu() {
    const [params] = useSearchParams();
    const tableParam = params.get("table");
    const modeParam = params.get("mode");
    const mode = tableParam ? "dine_in" : modeParam === "delivery" ? "delivery" : null;

    const [query, setQuery] = useState("");
    const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
    const sectionRefs = useRef({});

    useEffect(() => {
        // Persist mode/table for checkout
        if (tableParam) {
            sessionStorage.setItem("hotspot_order_mode", "dine_in");
            sessionStorage.setItem("hotspot_table_number", tableParam);
        } else if (modeParam === "delivery") {
            sessionStorage.setItem("hotspot_order_mode", "delivery");
            sessionStorage.removeItem("hotspot_table_number");
        }
    }, [tableParam, modeParam]);

    const filtered = useMemo(() => searchMenu(query), [query]);

    const groupedByCategory = useMemo(() => {
        const groups = {};
        for (const c of CATEGORIES) groups[c] = [];
        for (const item of filtered) {
            if (groups[item.category]) groups[item.category].push(item);
        }
        return groups;
    }, [filtered]);

    const scrollToCategory = (cat) => {
        setActiveCat(cat);
        const el = sectionRefs.current[cat];
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    // Update active tab on scroll
    useEffect(() => {
        const onScroll = () => {
            for (const cat of CATEGORIES) {
                const el = sectionRefs.current[cat];
                if (!el) continue;
                const r = el.getBoundingClientRect();
                if (r.top <= 200 && r.bottom > 200) {
                    setActiveCat(cat);
                    break;
                }
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            {/* Banner */}
            <div className="bg-white border-b border-warmBorder">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl md:text-4xl">Our Menu</h1>
                        <p className="text-sm text-muted-foreground mt-1">Crafted fresh, served hot.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {mode === "dine_in" && (
                            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium" data-testid="mode-badge-dinein">
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                Dine-in · Table {tableParam}
                            </span>
                        )}
                        {mode === "delivery" && (
                            <span className="inline-flex items-center gap-2 bg-brand/10 text-brand border border-brand/30 px-3 py-1.5 rounded-full text-xs font-medium" data-testid="mode-badge-delivery">
                                <MapPin className="w-3.5 h-3.5" />
                                Home Delivery
                            </span>
                        )}
                        <div className="relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search items..."
                                className="pl-9 pr-4 py-2 rounded-full border border-warmBorder bg-white text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-48 md:w-64"
                                data-testid="menu-search-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky tabs */}
            <div className="sticky top-16 z-30 bg-cream/95 backdrop-blur border-b border-warmBorder">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => scrollToCategory(cat)}
                                className={`tab-underline relative whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                                    activeCat === cat ? "text-brand is-active" : "text-muted-foreground hover:text-foreground"
                                }`}
                                data-testid={`category-tab-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sections */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
                {CATEGORIES.map((cat) => {
                    const items = groupedByCategory[cat] || [];
                    if (items.length === 0) return null;
                    return (
                        <section
                            key={cat}
                            ref={(el) => (sectionRefs.current[cat] = el)}
                            className="mb-12"
                            data-testid={`category-section-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <h2 className="font-display text-2xl md:text-3xl">{cat}</h2>
                                <span className="text-xs text-muted-foreground">{items.length} items</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {items.map((it) => (
                                    <MenuItemCard key={it.id} item={it} />
                                ))}
                            </div>
                        </section>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="py-24 text-center" data-testid="menu-empty">
                        <p className="font-display text-2xl">No items found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search.</p>
                    </div>
                )}
            </main>

            <Footer />
            <CartDrawer />
        </div>
    );
}
