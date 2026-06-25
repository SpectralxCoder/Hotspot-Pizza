import React from "react";
import { CheckCircle2, ChefHat, Truck, PackageCheck, XCircle } from "lucide-react";

const STEPS = [
    { key: "Accepted", label: "Order Accepted", Icon: CheckCircle2 },
    { key: "Preparing", label: "Being Prepared", Icon: ChefHat },
    { key: "Out For Delivery", label: "Out for Delivery", Icon: Truck },
    { key: "Delivered", label: "Delivered", Icon: PackageCheck },
];

export default function OrderTracker({ status, rejection_reason, mode }) {
    if (status === "Rejected") {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="order-tracker-rejected">
                <h3 className="font-display text-2xl font-extrabold mb-3 inline-flex items-center gap-2 text-brand">
                    <XCircle className="w-6 h-6" /> Order Rejected
                </h3>
                <p className="text-sm text-muted-foreground">
                    {rejection_reason ? `Reason: ${rejection_reason}` : "Sorry, this order couldn't be accepted."}
                </p>
            </div>
        );
    }

    const activeIndex = Math.max(STEPS.findIndex((s) => s.key === status), 0);
    const visibleSteps = mode === "dine_in" ? STEPS.filter((s) => s.key !== "Out For Delivery") : STEPS;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="order-tracker">
            <h3 className="font-display text-2xl font-extrabold mb-6">Order Status</h3>
            <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-warmBeige" />
                <div className="absolute left-5 top-5 w-0.5 bg-brand transition-all duration-700"
                    style={{ height: `${Math.min(100, (activeIndex / Math.max(1, visibleSteps.length - 1)) * 100)}%` }} />
                <ul className="space-y-6 relative">
                    {visibleSteps.map((s, idx) => {
                        const stepIndex = STEPS.findIndex((x) => x.key === s.key);
                        const isDone = stepIndex <= activeIndex;
                        const isCurrent = stepIndex === activeIndex;
                        const Icon = s.Icon;
                        return (
                            <li key={s.key} className="flex items-center gap-4" data-testid={`tracker-step-${s.key.toLowerCase().replace(/\s+/g, "-")}`}>
                                <span className={`relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    isDone ? (idx === visibleSteps.length - 1 ? "border-emerald-600 bg-emerald-600 text-white" : "border-brand bg-brand text-white") : "border-warmBeige bg-white text-muted-foreground"
                                } ${isCurrent ? "ring-4 ring-brand/15" : ""}`}>
                                    <Icon className="w-5 h-5" />
                                </span>
                                <div>
                                    <p className={`font-semibold ${isDone ? "" : "text-muted-foreground"}`}>{s.label}</p>
                                    {isCurrent && (<p className="text-xs text-brand mt-0.5">In progress…</p>)}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
