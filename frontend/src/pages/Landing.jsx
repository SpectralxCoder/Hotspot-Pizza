import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { HERO_IMAGE, MENU } from "../data/menu";

const featured = ["margherita", "supreme-pizza", "double-cheese-blast", "cheese-stuffed-garlic-bread"];

export default function Landing() {
    const featuredItems = featured
        .map((id) => MENU.find((m) => m.id === id))
        .filter(Boolean);

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            {/* Hero */}
            <section className="relative overflow-hidden" data-testid="landing-hero">
                <div className="absolute inset-0">
                    <img src={HERO_IMAGE} alt="Hot pizza" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/30" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32 lg:py-40">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-warmBorder px-3 py-1 rounded-full text-xs font-medium" data-testid="hero-tagline">
                            <Sparkles className="w-3.5 h-3.5 text-brand" />
                            Where every slice tells a story
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mt-5 leading-[1.05]">
                            Pizzas baked
                            <br />
                            with <span className="text-brand">heart</span> &amp; flame.
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-lg">
                            Stone-baked crusts, farm-fresh veggies & house-made sauces. Order in or have a hot box delivered to your door.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/menu?mode=delivery"
                                className="inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3.5 rounded-full font-medium hover:bg-brand-700 active:scale-95 transition-all shadow-hover"
                                data-testid="cta-order-now"
                            >
                                Order Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/menu"
                                className="inline-flex items-center justify-center gap-2 bg-white border border-warmBorder text-foreground px-6 py-3.5 rounded-full font-medium hover:border-brand active:scale-95 transition-all"
                                data-testid="cta-view-menu"
                            >
                                Browse Menu
                            </Link>
                        </div>
                        <div className="mt-10 flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-warmOrange" /> 4.8 · 2,300+ reviews</div>
                            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Veg Kitchen</div>
                            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-brand" /> 20–30 min delivery</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 w-full" data-testid="landing-featured">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-sm text-brand font-medium">Today&apos;s favourites</p>
                        <h2 className="font-display text-3xl md:text-4xl mt-1">Fan-loved slices</h2>
                    </div>
                    <Link to="/menu" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-brand font-medium hover:underline">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {featuredItems.map((item) => (
                        <Link
                            key={item.id}
                            to="/menu"
                            className="group bg-white rounded-2xl overflow-hidden border border-warmBorder lift block"
                            data-testid={`featured-${item.id}`}
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold leading-tight">{item.name}</h3>
                                <p className="text-sm text-brand font-medium mt-1">
                                    From ₹{item.sizes ? Math.min(...item.sizes.map((s) => s.price)) : item.price}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA strip */}
            <section className="bg-white border-y border-warmBorder">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2">
                        <h3 className="font-display text-3xl">Dining in? Scan & order.</h3>
                        <p className="text-muted-foreground mt-2">Find a QR on your table — scan it to send orders straight to the kitchen. No queues, no waits.</p>
                    </div>
                    <Link to="/menu?mode=delivery" className="justify-self-start md:justify-self-end inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition-all" data-testid="cta-delivery-strip">
                        Order Home Delivery
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <Footer />
            <CartDrawer />
        </div>
    );
}
