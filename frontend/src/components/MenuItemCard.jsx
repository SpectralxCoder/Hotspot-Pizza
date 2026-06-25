import React, { useState } from "react";
import { Plus, Sparkles, Leaf } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import PizzaSizeDialog from "./PizzaSizeDialog";
import { toast } from "sonner";

export default function MenuItemCard({ item }) {
    const { addItem } = useCart();
    const [sizeOpen, setSizeOpen] = useState(false);
    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
    const unavailable = item.in_stock === false;
    const reason = item.unavailable_reason || "Unavailable";

    // Compute display + add prices honoring discount_price
    const baseMin = hasSizes ? Math.min(...item.sizes.map((s) => s.price)) : item.price;
    const displayPrice = item.discount_price != null && item.discount_price > 0 && !hasSizes ? Number(item.discount_price) : baseMin;
    const originalPrice = item.discount_price != null && item.discount_price > 0 && !hasSizes ? baseMin : null;

    const handleAdd = () => {
        if (unavailable) { toast.error(reason); return; }
        if (hasSizes) { setSizeOpen(true); return; }
        const finalPrice = item.discount_price != null && item.discount_price > 0 ? Number(item.discount_price) : item.price;
        addItem({ id: item.id, name: item.name, price: finalPrice, originalPrice: item.discount_price ? item.price : null, image: item.image });
        toast.success(`Added ${item.name}`);
    };

    return (
        <>
            <article className={`group bg-white rounded-[24px] overflow-hidden lift fade-in-up ${unavailable ? "opacity-75" : ""}`} data-testid={`menu-card-${item.id}`}>
                <div className="relative aspect-[5/4] overflow-hidden bg-warmBeige">
                    {item.image && (<img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />)}
                    {item.is_popular && !unavailable && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full" data-testid={`popular-badge-${item.id}`}>
                            <Sparkles className="w-3 h-3" /> Most Popular
                        </span>
                    )}
                    {unavailable && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-foreground text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full" data-testid={`unavailable-${item.id}`}>{reason}</span>
                        </div>
                    )}
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                            <Leaf className="w-2.5 h-2.5" /> Veg
                        </span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 min-h-[40px]">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <p className="font-display text-2xl font-extrabold">
                                {hasSizes && <span className="text-xs font-medium text-muted-foreground mr-0.5">from </span>}
                                ₹{displayPrice}
                            </p>
                            {originalPrice && (<span className="text-sm text-muted-foreground line-through" data-testid={`original-price-${item.id}`}>₹{originalPrice}</span>)}
                        </div>
                        <button onClick={handleAdd} disabled={unavailable}
                            className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            data-testid={unavailable ? `unavailable-btn-${item.id}` : `add-to-cart-${item.id}`}>
                            {unavailable ? "Unavailable" : (<><Plus className="w-4 h-4" strokeWidth={2.75} /> Add</>)}
                        </button>
                    </div>
                </div>
            </article>
            {hasSizes && (
                <PizzaSizeDialog open={sizeOpen} onClose={() => setSizeOpen(false)} item={item}
                    onConfirm={(size) => {
                        addItem({ id: item.id, name: item.name, price: size.price, size: size.size, image: item.image });
                        toast.success(`Added ${item.name} (${size.size})`);
                        setSizeOpen(false);
                    }} />
            )}
        </>
    );
}
