import React from "react";
import { Flame, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-ink text-white mt-20" data-testid="footer">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-3 gap-10">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand text-white">
                            <Flame className="w-5 h-5" strokeWidth={2.5} />
                        </span>
                        <span className="font-display text-2xl font-extrabold">Hotspot</span>
                    </div>
                    <p className="text-sm text-white/60 mt-4 max-w-xs leading-relaxed">
                        Born in the kitchen. Forged in flame. Hotspot serves fast food the way it was meant to be — bold, fresh, and unapologetically delicious.
                    </p>
                </div>
                <div>
                    <p className="eyebrow text-brand">Visit</p>
                    <div className="mt-3 text-sm text-white/80 leading-relaxed">
                        <p>42, Flame Lane</p>
                        <p>Bengaluru, India 560001</p>
                        <p className="text-white/60 mt-3">Daily · 11AM — 11PM</p>
                    </div>
                </div>
                <div>
                    <p className="eyebrow text-brand">Follow</p>
                    <div className="mt-3 flex items-center gap-3">
                        <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/5 transition-colors">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/5 transition-colors">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/5 transition-colors">
                            <Facebook className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 text-center py-5 text-xs text-white/50">
                © {new Date().getFullYear()} Hot Spot Pizza. All rights reserved.
            </div>
        </footer>
    );
}
