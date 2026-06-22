// Reusable confirmation dialog to replace native window.confirm.
import React, { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [state, setState] = useState({ open: false, title: "", message: "", confirmText: "Confirm", cancelText: "Cancel", tone: "primary", resolver: null });

    const ask = useCallback((opts) => {
        return new Promise((resolve) => {
            setState({
                open: true,
                title: opts.title || "Are you sure?",
                message: opts.message || "",
                confirmText: opts.confirmText || "Confirm",
                cancelText: opts.cancelText || "Cancel",
                tone: opts.tone || "primary",
                resolver: resolve,
            });
        });
    }, []);

    const close = (result) => {
        state.resolver?.(result);
        setState((s) => ({ ...s, open: false, resolver: null }));
    };

    return (
        <ConfirmContext.Provider value={{ ask }}>
            {children}
            {state.open && (
                <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4" data-testid="confirm-backdrop">
                    <div className="bg-white rounded-[28px] p-6 max-w-md w-full shadow-drawer" data-testid="confirm-dialog">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="font-display text-2xl font-extrabold">{state.title}</h3>
                            <button onClick={() => close(false)} className="p-1.5 rounded-full hover:bg-cream" aria-label="Close" data-testid="confirm-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {state.message && <p className="text-sm text-muted-foreground mt-2">{state.message}</p>}
                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                onClick={() => close(false)}
                                className="px-5 py-2.5 rounded-full font-semibold text-sm bg-cream hover:bg-warmBeige"
                                data-testid="confirm-cancel"
                            >
                                {state.cancelText}
                            </button>
                            <button
                                onClick={() => close(true)}
                                className={`px-5 py-2.5 rounded-full font-semibold text-sm text-white ${
                                    state.tone === "danger" ? "bg-brand hover:bg-brand-700" : "bg-foreground hover:opacity-90"
                                }`}
                                data-testid="confirm-ok"
                            >
                                {state.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
    return ctx.ask;
}
