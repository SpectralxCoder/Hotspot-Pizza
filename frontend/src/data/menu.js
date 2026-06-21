// Hot Spot Pizza — Static Menu Catalogue
// Images sourced from /app/design_guidelines.json (Unsplash / Pexels).

const IMG = {
    veg_pizza: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHx2ZWclMjBwaXp6YSUyMHNsaWNlJTIwcnVzdGljJTIwYnJpZ2h0fGVufDB8fHx8MTc4MjA3NTUwMXww&ixlib=rb-4.1.0&q=85",
    burger: "https://images.pexels.com/photos/5745991/pexels-photo-5745991.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    garlic_bread: "https://images.pexels.com/photos/13062441/pexels-photo-13062441.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    milkshake: "https://images.pexels.com/photos/32469289/pexels-photo-32469289.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    combo: "https://images.pexels.com/photos/29418865/pexels-photo-29418865.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    hero: "https://images.pexels.com/photos/8646740/pexels-photo-8646740.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=940&q=80",
    snack: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=940&q=80",
};

const pizzaSizes = (r, m, l) => [
    { size: "Regular", price: r },
    { size: "Medium", price: m },
    { size: "Large", price: l },
];

const id = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const make = (name, category, description, price, image, opts = {}) => ({
    id: id(name),
    name,
    category,
    description,
    price,
    image,
    veg: true,
    ...opts,
});

export const HERO_IMAGE = IMG.hero;

export const CATEGORIES = [
    "Combos",
    "Snacks",
    "Desserts",
    "Garlic Bread",
    "Shakes",
    "Simple Veg Pizza",
    "Veg Special",
    "Veg Treat",
    "Feast Special",
    "Hot Pizza Special",
    "Burgers",
];

export const MENU = [
    // COMBOS
    make("Cheese Corn + Parcel + Pepsi 200", "Combos", "Crispy cheese-corn delight, a stuffed parcel & a chilled Pepsi 200ml.", 210, IMG.combo),

    // SNACKS
    make("Calzon Pocket", "Snacks", "Folded pizza pocket stuffed with cheese, herbs & veggies.", 180, IMG.snack),
    make("Veg Parcel", "Snacks", "Crispy golden parcel filled with spiced veggies.", 80, IMG.snack),

    // DESSERTS
    make("Choco Lava", "Desserts", "Warm molten chocolate cake with a soft gooey center.", 140, IMG.dessert),
    make("Love Pizza", "Desserts", "Heart-shaped sweet pizza with chocolate, nuts & love.", 399, IMG.dessert),

    // GARLIC BREAD
    make("Cheese Garlic Bread", "Garlic Bread", "Buttery garlic bread loaded with melted mozzarella.", 160, IMG.garlic_bread),
    make("Cheese Stuffed Garlic Bread", "Garlic Bread", "Pillowy bread stuffed with extra gooey cheese.", 180, IMG.garlic_bread),
    make("2 Pcs Plain Garlic Bread", "Garlic Bread", "Two classic garlic bread sticks brushed with herb butter.", 200, IMG.garlic_bread),
    make("Supreme Garlic Bread", "Garlic Bread", "Loaded with veggies, herbs and triple cheese.", 200, IMG.garlic_bread),
    make("Makhni Garlic Bread", "Garlic Bread", "Creamy makhani sauce twist on our cheese garlic bread.", 220, IMG.garlic_bread),

    // SHAKES
    make("Cold Coffee", "Shakes", "Chilled cold coffee whipped to a creamy froth.", 120, IMG.milkshake),
    make("Oreo Shake", "Shakes", "Thick milkshake blended with Oreo cookies.", 140, IMG.milkshake),
    make("Kitkat Shake", "Shakes", "Creamy shake loaded with crunchy KitKat bites.", 160, IMG.milkshake),
    make("Hot Chocolate Shake", "Shakes", "Warm chocolate shake topped with whipped cream.", 180, IMG.milkshake),

    // SIMPLE VEG PIZZA
    make("Margherita", "Simple Veg Pizza", "Classic cheese & herb pizza on a fresh base.", null, IMG.veg_pizza, { sizes: pizzaSizes(180, 380, 580) }),
    make("Double Cheese Blast", "Simple Veg Pizza", "Twice the mozzarella, twice the indulgence.", null, IMG.veg_pizza, { sizes: pizzaSizes(200, 400, 600) }),

    // VEG SPECIAL
    make("Supreme Pizza", "Veg Special", "Loaded with capsicum, onion, corn, jalapeno & cheese.", null, IMG.veg_pizza, { sizes: pizzaSizes(360, 640, 900) }),
    make("Hot Farm House Pizza", "Veg Special", "Farm-fresh veggies on a herbed pizza base.", null, IMG.veg_pizza, { sizes: pizzaSizes(360, 640, 900) }),
    make("Pepper Pocket", "Veg Special", "Stuffed pocket pizza with peppers and spices.", null, IMG.veg_pizza, { sizes: pizzaSizes(360, 640, 900) }),
    make("Party Paradise", "Veg Special", "A party of toppings made for sharing.", null, IMG.veg_pizza, { sizes: pizzaSizes(360, 640, 900) }),

    // VEG TREAT
    make("Cheese & Tomato", "Veg Treat", "Sweet tomatoes and stretchy mozzarella cheese.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),
    make("Cheese & Corn", "Veg Treat", "Buttery corn with melted cheese over a crispy base.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),
    make("Cheese & Paneer Onion", "Veg Treat", "Soft paneer & onion with double mozzarella.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),
    make("Cheese & Onion Capsicum", "Veg Treat", "Crunchy onion & capsicum on a cheesy base.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),
    make("Cheese Mushroom", "Veg Treat", "Earthy mushrooms paired with creamy cheese.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),
    make("Cheese Jalapeno Onion", "Veg Treat", "Spicy jalapenos and onions on melted cheese.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),
    make("Cheese Makhani Pizza", "Veg Treat", "Buttery makhani sauce with stretchy mozzarella.", null, IMG.veg_pizza, { sizes: pizzaSizes(240, 440, 660) }),

    // FEAST SPECIAL
    make("Gourmet", "Feast Special", "Chef's curated gourmet toppings on artisanal base.", null, IMG.veg_pizza, { sizes: pizzaSizes(300, 500, 700) }),
    make("Cheese Lover", "Feast Special", "Four-cheese explosion for true cheese lovers.", null, IMG.veg_pizza, { sizes: pizzaSizes(300, 500, 700) }),
    make("Veg Lover", "Feast Special", "All your favourite veggies on one slice.", null, IMG.veg_pizza, { sizes: pizzaSizes(300, 500, 700) }),
    make("Exotic Paneer", "Feast Special", "Tandoori paneer with exotic spices and herbs.", null, IMG.veg_pizza, { sizes: pizzaSizes(300, 500, 700) }),
    make("Spicy Delight", "Feast Special", "Bold flavours, fiery peppers & extra cheese.", null, IMG.veg_pizza, { sizes: pizzaSizes(300, 500, 700) }),
    make("Veg Delight", "Feast Special", "A balanced delight of cheese, veggies & herbs.", null, IMG.veg_pizza, { sizes: pizzaSizes(300, 500, 700) }),

    // HOT PIZZA SPECIAL
    make("Garden Party", "Hot Pizza Special", "Farm-fresh veggies tossed in herb oil.", null, IMG.veg_pizza, { sizes: pizzaSizes(379, 699, 999) }),
    make("Chilly Pizza", "Hot Pizza Special", "Hot chillies, garlic & double mozzarella.", null, IMG.veg_pizza, { sizes: pizzaSizes(379, 699, 999) }),
    make("Very Hot Pizza", "Hot Pizza Special", "Extra-spicy lava sauce for the brave.", null, IMG.veg_pizza, { sizes: pizzaSizes(379, 699, 999) }),
    make("Mexicon Pizza", "Hot Pizza Special", "Mexican-style salsa, beans & jalapenos.", null, IMG.veg_pizza, { sizes: pizzaSizes(379, 699, 999) }),

    // BURGERS
    make("Aaloo Tikki Burger", "Burgers", "Crispy aloo tikki, lettuce & tangy sauce.", 80, IMG.burger),
    make("Cheese Burger", "Burgers", "Melted cheese over a juicy veg patty.", 100, IMG.burger),
    make("Onion Tomato Burger", "Burgers", "Fresh onion-tomato crunch with herb mayo.", 100, IMG.burger),
    make("Onion Capsicum Burger", "Burgers", "Onion & capsicum loaded burger.", 120, IMG.burger),
    make("Corn Burger", "Burgers", "Sweet corn patty with creamy mayo.", 140, IMG.burger),
    make("Paneer Burger", "Burgers", "Spiced paneer patty with tangy sauce.", 160, IMG.burger),
    make("Makhni Burger", "Burgers", "Rich makhani sauce in a soft bun.", 160, IMG.burger),
    make("Double Tikki Burger", "Burgers", "Two crispy tikkis stacked with cheese.", 199, IMG.burger),
];

export function getCategoryItems(category) {
    return MENU.filter((m) => m.category === category);
}

export function searchMenu(q) {
    if (!q) return MENU;
    const term = q.toLowerCase();
    return MENU.filter(
        (m) => m.name.toLowerCase().includes(term) || m.description.toLowerCase().includes(term)
    );
}
