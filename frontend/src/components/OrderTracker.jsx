import React from "react";
import { CheckCircle2, ChefHat, Truck, PackageCheck } from "lucide-react";

const STEPS = [
    { key: "Received", label: "Order Received", Icon: CheckCircle2 },
    { key: "Preparing", label: "Being Prepared", Icon: ChefHat },
    { key: "Ready", label: "Ready / Out for Delivery", Icon: Truck },
    { key: "Delivered", label: "Delivered", Icon: PackageCheck },
];

export default function OrderTracker({ status }) {
    const activeIndex = Math.max(STEPS.findIndex((s) => s.key === status), 0);

    return (
        <div className="bg-white rounded-2xl border border-warmBorder p-6 shadow-soft" data-testid="order-tracker">
            <h3 className="font-display text-2xl mb-6">Order Status</h3>
            <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-warmBorder" aria-hidden />
                <div
                    className="absolute left-5 top-5 w-0.5 bg-brand transition-all duration-700"
                    style={{ height: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                    aria-hidden
                />
                <ul className="space-y-6 relative">
                    {STEPS.map((s, idx) => {
                        const isDone = idx <= activeIndex;
                        const isCurrent = idx === activeIndex;
                        const Icon = s.Icon;
                        return (
                            <li key={s.key} className="flex items-center gap-4" data-testid={`tracker-step-${s.key.toLowerCase()}`}>
                                <span
                                    className={`relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                        isDone
                                            ? idx === STEPS.length - 1
                                                ? "border-emerald-600 bg-emerald-600 text-white"
                                                : "border-brand bg-brand text-white"
                                            : "border-warmBorder bg-white text-muted-foreground"
                                    } ${isCurrent ? "ring-4 ring-brand/15" : ""}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </span>
                                <div>
                                    <p className={`font-medium ${isDone ? "" : "text-muted-foreground"}`}>{s.label}</p>
                                    {isCurrent && (
                                        <p className="text-xs text-brand mt-0.5">In progress…</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
