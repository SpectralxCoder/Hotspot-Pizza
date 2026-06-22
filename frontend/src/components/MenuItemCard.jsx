import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import PizzaSizeDialog from "./PizzaSizeDialog";
import { toast } from "sonner";

// Category → badge tags
const CATEGORY_TAGS = {
    "Combos": ["SPICY", "VEG"],
    "Snacks": ["VEG"],
    "Desserts": ["SWEET"],
    "Garlic Bread": ["VEG"],
    "Shakes": ["SWEET"],
    "Simple Veg Pizza": ["VEG"],
    "Veg Special": ["SPICY", "VEG"],
    "Veg Treat": ["VEG"],
    "Feast Special": ["VEG"],
    "Hot Pizza Special": ["SPICY", "VEG"],
    "Burgers": ["VEG"],
};

const tagStyles = {
    SPICY: "text-brand",
    VEG: "text-emerald-700 bg-emerald-50",
    "NON-VEG": "text-brand bg-brand/10",
    SWEET: "text-amber-700 bg-amber-50",
};

export default function MenuItemCard({ item }) {
    const { addItem } = useCart();
    const [sizeOpen, setSizeOpen] = useState(false);
    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
    const tags = CATEGORY_TAGS[item.category] || ["VEG"];

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
                className="group bg-white rounded-[24px] overflow-hidden lift fade-in-up"
                data-testid={`menu-card-${item.id}`}
            >
                <div className="relative aspect-[5/4] overflow-hidden bg-warmBeige">
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2.5">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className={`text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded ${tagStyles[t] || "text-muted-foreground"}`}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                    <h3 className="font-display text-lg font-extrabold leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 min-h-[40px]">
                        {item.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="font-display text-2xl font-extrabold">
                            {hasSizes && <span className="text-xs font-medium text-muted-foreground mr-0.5">from </span>}
                            ₹{minPrice}
                        </p>
                        <button
                            onClick={handleAdd}
                            className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all"
                            data-testid={`add-to-cart-${item.id}`}
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.75} />
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
