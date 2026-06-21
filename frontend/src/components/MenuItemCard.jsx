import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import PizzaSizeDialog from "./PizzaSizeDialog";
import { toast } from "sonner";

export default function MenuItemCard({ item }) {
    const { addItem } = useCart();
    const [sizeOpen, setSizeOpen] = useState(false);
    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;

    const handleAdd = () => {
        if (hasSizes) {
            setSizeOpen(true);
            return;
        }
        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
        });
        toast.success(`Added ${item.name}`);
    };

    const minPrice = hasSizes ? Math.min(...item.sizes.map((s) => s.price)) : item.price;

    return (
        <>
            <article
                className="group bg-white rounded-2xl overflow-hidden border border-warmBorder lift fade-in-up"
                data-testid={`menu-card-${item.id}`}
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                        className="absolute top-3 left-3 inline-flex items-center justify-center w-5 h-5 border-2 border-emerald-600 bg-white rounded-sm"
                        title="Vegetarian"
                        aria-label="Vegetarian"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    </span>
                </div>
                <div className="p-5">
                    <h3 className="font-semibold text-base leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 min-h-[40px]">
                        {item.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            {hasSizes ? (
                                <p className="text-xs text-muted-foreground">From</p>
                            ) : null}
                            <p className="font-display text-2xl text-brand leading-none">₹{minPrice}</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 active:scale-95 transition-all shadow-soft"
                            data-testid={`add-to-cart-${item.id}`}
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>
            </article>
            {hasSizes && (
                <PizzaSizeDialog
                    open={sizeOpen}
                    onClose={() => setSizeOpen(false)}
                    item={item}
                    onConfirm={(size) => {
                        addItem({
                            id: item.id,
                            name: item.name,
                            price: size.price,
                            size: size.size,
                            image: item.image,
                        });
                        toast.success(`Added ${item.name} (${size.size})`);
                        setSizeOpen(false);
                    }}
                />
            )}
        </>
    );
}
