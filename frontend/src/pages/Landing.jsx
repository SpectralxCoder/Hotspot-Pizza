import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Flame, ShieldCheck, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { HERO_IMAGE, MENU } from "../data/menu";

const featured = ["supreme-pizza", "double-cheese-blast", "very-hot-pizza", "margherita"];

export default function Landing() {
    const featuredItems = featured
        .map((id) => MENU.find((m) => m.id === id))
        .filter(Boolean);

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            {/* HERO — split card */}
            <section className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-4 md:pt-6" data-testid="landing-hero">
                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    {/* Left: dark card */}
                    <div className="bg-ink text-white rounded-[28px] p-8 md:p-12 lg:p-14 flex flex-col justify-between min-h-[460px] md:min-h-[540px]">
                        <p className="eyebrow text-brand" data-testid="hero-eyebrow">Fast Food · Café · Open Daily</p>
                        <div className="mt-8 md:mt-0">
                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02]">
                                Some food cools.
                                <br />
                                <span className="text-brand">Ours burns brighter.</span>
                            </h1>
                            <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-md">
                                From smash-stacked burgers to oven-fired pizzas, every bite at Hotspot is dialed up. Order in. Pick up. We bring the heat.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/menu?mode=delivery"
                                    className="inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3.5 rounded-full font-semibold hover:bg-brand-700 active:scale-95 transition-all"
                                    data-testid="cta-order-now"
                                >
                                    Order Now
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/menu"
                                    className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-white/5 transition-all"
                                    data-testid="cta-view-menu"
                                >
                                    See the Menu
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right: image card */}
                    <div className="relative rounded-[28px] overflow-hidden min-h-[460px] md:min-h-[540px] bg-ink-2">
                        <img
                            src={HERO_IMAGE}
                            alt="Signature hot pizza"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-5 shadow-soft">
                            <p className="eyebrow">Signature</p>
                            <p className="font-display text-2xl font-extrabold mt-1">Hotspot Supreme</p>
                            <p className="text-sm text-muted-foreground mt-1">Hand-tossed crust · 5-cheese blend · Fire-roasted veggies</p>
                        </div>
                    </div>
                </div>

                {/* Feature row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-5">
                    <FeatureCard Icon={Truck} title="30 min" subtitle="Average delivery in your zone" testid="feature-delivery" />
                    <FeatureCard Icon={Flame} title="40+" subtitle="Original recipes, fired in-house" tone="beige" testid="feature-recipes" />
                    <FeatureCard Icon={ShieldCheck} title="Pay later" subtitle="Cash on delivery · No prepay" testid="feature-pay" />
                </div>
            </section>

            {/* TRENDING */}
            <section className="max-w-7xl mx-auto w-full px-4 md:px-8 py-20 md:py-28" data-testid="landing-featured">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                    <div>
                        <p className="eyebrow">Trending Now</p>
                        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mt-3">Built for hungry humans.</h2>
                    </div>
                    <Link to="/menu" className="inline-flex items-center gap-1.5 text-base font-semibold hover:text-brand transition-colors" data-testid="link-full-menu">
                        See full menu <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {featuredItems.map((item) => (
                        <Link
                            key={item.id}
                            to="/menu"
                            className="group bg-white rounded-[24px] overflow-hidden lift block"
                            data-testid={`featured-${item.id}`}
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold tracking-widest text-brand uppercase">Spicy</span>
                                    <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Veg</span>
                                </div>
                                <h3 className="font-display text-lg font-extrabold leading-tight">{item.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                <p className="font-display text-xl font-extrabold mt-3">
                                    ₹{item.sizes ? Math.min(...item.sizes.map((s) => s.price)) : item.price}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* STORY */}
            <section className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-20 md:pb-28">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div>
                        <p className="eyebrow">The Story</p>
                        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mt-3 leading-tight">We don&apos;t do beige food.</h2>
                        <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-md leading-relaxed">
                            Hotspot started as a single-counter operation in a back alley. Today we&apos;re a fast-growing café-meets-flame-kitchen serving everything from molten-cheese fries to nuclear wings.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-brand" />
                            <span>Open 11AM — 11PM, every day.</span>
                        </div>
                    </div>
                    <div className="rounded-[28px] overflow-hidden aspect-[4/3]">
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                            alt="Inside the Hotspot kitchen"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            <Footer />
            <CartDrawer />
        </div>
    );
}

function FeatureCard({ Icon, title, subtitle, tone = "white", testid }) {
    const bg = tone === "beige" ? "bg-warmBeige" : "bg-white";
    return (
        <div className={`${bg} rounded-[24px] p-6 md:p-8`} data-testid={testid}>
            <Icon className="w-6 h-6 text-brand" strokeWidth={2.25} />
            <p className="font-display text-3xl md:text-4xl font-extrabold mt-6">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
    );
}
