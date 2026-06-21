import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function PizzaSizeDialog({ open, onClose, item, onConfirm }) {
    const [selected, setSelected] = useState(item?.sizes?.[0]);

    useEffect(() => {
        if (open) setSelected(item?.sizes?.[0]);
    }, [open, item]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
            onClick={onClose}
            data-testid="size-dialog-backdrop"
        >
            <div
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-drawer animate-in slide-in-from-bottom-5"
                onClick={(e) => e.stopPropagation()}
                data-testid="size-dialog"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-display text-2xl">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Choose your size</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-cream" data-testid="size-dialog-close" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-5 space-y-2">
                    {item.sizes.map((s) => (
                        <button
                            key={s.size}
                            onClick={() => setSelected(s)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                selected?.size === s.size
                                    ? "border-brand bg-brand/5"
                                    : "border-warmBorder hover:border-brand/40"
                            }`}
                            data-testid={`size-option-${s.size.toLowerCase()}`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`w-4 h-4 rounded-full border-2 ${
                                        selected?.size === s.size ? "border-brand bg-brand" : "border-warmBorder"
                                    }`}
                                />
                                <span className="font-medium">{s.size}</span>
                            </div>
                            <span className="font-display text-xl text-brand">₹{s.price}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onConfirm(selected)}
                    disabled={!selected}
                    className="mt-6 w-full bg-brand text-white py-3 rounded-full font-medium hover:bg-brand-700 active:scale-[0.98] transition-all"
                    data-testid="size-dialog-confirm"
                >
                    Add to cart — ₹{selected?.price}
                </button>
            </div>
        </div>
    );
}
