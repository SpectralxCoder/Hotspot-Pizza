import React from "react";
import { Flame, Instagram, Twitter, Facebook, MapPin, Phone } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

export default function Footer() {
    const { settings } = useSettings();
    const shopName = settings?.shop_name || "Hotspot Pizza";
    const address = settings?.address || "G16A, Block G, Sector 23, Sanjay Nagar, Ghaziabad, UP 201017";
    const phone = settings?.contact_number || "+91 98XXXXXXXX";

    return (
        <footer className="bg-ink text-white mt-20" data-testid="footer">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-3 gap-10">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand text-white">
                            <Flame className="w-5 h-5" strokeWidth={2.5} />
                        </span>
                        <span className="font-display text-2xl font-extrabold">{shopName}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-4 max-w-xs leading-relaxed">
                        Born in the kitchen. Forged in flame. Bold, fresh, &amp; unapologetically delicious.
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" /> 100% Pure Veg Kitchen
                    </span>
                </div>
                <div>
                    <p className="eyebrow text-brand">Visit</p>
                    <div className="mt-3 text-sm text-white/80 leading-relaxed flex items-start gap-2" data-testid="footer-address">
                        <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <span>{address}</span>
                    </div>
                    <div className="mt-3 text-sm text-white/80 inline-flex items-center gap-2" data-testid="footer-phone">
                        <Phone className="w-4 h-4 text-brand" />
                        <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline">{phone}</a>
                    </div>
                </div>
                <div>
                    <p className="eyebrow text-brand">Follow</p>
                    <div className="mt-3 flex items-center gap-3">
                        <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/5">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/5">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/5">
                            <Facebook className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 text-center py-5 text-xs text-white/50">
                © {new Date().getFullYear()} {shopName}. All rights reserved.
            </div>
        </footer>
    );
}
