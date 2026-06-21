import React from "react";
import { Pizza } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-warmBorder mt-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand text-white">
                            <Pizza className="w-5 h-5" />
                        </span>
                        <span className="font-display text-xl">Hot Spot <span className="text-brand">Pizza</span></span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 max-w-xs">
                        Where every slice tells a story. Handcrafted, fresh, and made with love.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-3">Visit Us</h4>
                    <p className="text-sm text-muted-foreground">Open daily — 11 AM to 11 PM</p>
                    <p className="text-sm text-muted-foreground mt-1">Dine-in · Takeaway · Delivery</p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-3">Order</h4>
                    <p className="text-sm text-muted-foreground">Scan the QR at your table or order online for home delivery.</p>
                </div>
            </div>
            <div className="border-t border-warmBorder text-center py-4 text-xs text-muted-foreground">
                © {new Date().getFullYear()} Hot Spot Pizza — All rights reserved.
            </div>
        </footer>
    );
}
