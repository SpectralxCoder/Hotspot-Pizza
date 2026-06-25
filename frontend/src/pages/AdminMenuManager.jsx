import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, X, Upload, Sparkles, Database, AlertTriangle, CheckSquare, Square, TrendingUp, TrendingDown } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listMenuItems, subscribeMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage, isV2SchemaApplied, bulkUpdate, bulkAdjustPrice } from "../lib/menuService";
import { seedMenuItems } from "../lib/seed";
import { useSettings } from "../contexts/SettingsContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { toast } from "sonner";

const EMPTY = { name: "", description: "", category: "", sizesText: "", basePrice: "", discount_price: "", image_url: "", in_stock: true, is_popular: false, sort_order: 0 };

// Parse "Size: small, Price: 200" lines into JSON sizes
function parseSizes(text) {
    if (!text || !text.trim()) return null;
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const out = [];
    for (const line of lines) {
        const m = line.match(/size\s*:\s*([^,]+),\s*price\s*:\s*([\d.]+)/i);
        if (m) out.push({ size: m[1].trim(), price: Number(m[2]) });
    }
    return out.length ? out : null;
}

function sizesToText(sizes) {
    if (!Array.isArray(sizes)) return "";
    return sizes.map((s) => `Size: ${s.size}, Price: ${s.price}`).join("\n");
}

export default function AdminMenuManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState("All");
    const [schemaOk, setSchemaOk] = useState(true);
    const [selected, setSelected] = useState(new Set());
    const [bulkPctOpen, setBulkPctOpen] = useState(false);
    const confirm = useConfirm();
    const { categories } = useSettings();

    const load = async () => {
        try { setItems(await listMenuItems()); }
        catch (e) { console.warn(e?.message); setItems([]); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        isV2SchemaApplied().then(setSchemaOk);
        load();
        const u = subscribeMenuItems(load);
        return u;
    }, []);

    const filtered = useMemo(() => filter === "All" ? items : items.filter((i) => i.category === filter), [items, filter]);

    const toggleSelect = (id) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelected(next);
    };
    const selectAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map((i) => i.id)));
    };

    const startNew = () => setEditing({ ...EMPTY, category: categories[0]?.name || "" });
    const startEdit = (it) => setEditing({
        ...it,
        sizesText: sizesToText(it.sizes),
        basePrice: it.price ?? "",
        discount_price: it.discount_price ?? "",
    });

    const handleSave = async (form) => {
        try {
            const sizes = parseSizes(form.sizesText);
            if (!form.name.trim()) return toast.error("Name required");
            if (!sizes && (form.basePrice === "" || isNaN(Number(form.basePrice)))) return toast.error("Provide price OR sizes");
            const body = {
                name: form.name.trim(),
                description: form.description?.trim() || null,
                category: form.category,
                price: sizes ? null : Number(form.basePrice),
                sizes,
                discount_price: form.discount_price === "" || form.discount_price == null ? null : Number(form.discount_price),
                image_url: form.image_url || null,
                in_stock: !!form.in_stock,
                is_popular: !!form.is_popular,
                sort_order: Number(form.sort_order) || 0,
            };
            if (form.id) await updateMenuItem(form.id, body);
            else await createMenuItem(body);
            toast.success(form.id ? "Item updated" : "Item created");
            setEditing(null);
            load();
        } catch (e) { toast.error(e?.message || "Save failed"); }
    };

    const handleDelete = async (it) => {
        const ok = await confirm({ title: "Delete menu item?", message: `"${it.name}" will be removed.`, confirmText: "Delete", tone: "danger" });
        if (!ok) return;
        try { await deleteMenuItem(it.id); toast.success("Deleted"); load(); }
        catch (e) { toast.error(e?.message || "Delete failed"); }
    };

    const handleBulkDelete = async () => {
        const ok = await confirm({ title: `Delete ${selected.size} items?`, confirmText: "Delete all", tone: "danger" });
        if (!ok) return;
        try {
            for (const id of selected) await deleteMenuItem(id);
            toast.success("Items deleted");
            setSelected(new Set());
            load();
        } catch (e) { toast.error(e?.message || "Failed"); }
    };
    const handleBulkInStock = async (val) => {
        try { await bulkUpdate([...selected], { in_stock: val }); toast.success(val ? "Marked available" : "Marked unavailable"); setSelected(new Set()); load(); }
        catch (e) { toast.error(e?.message || "Failed"); }
    };
    const handleBulkPrice = async (pct) => {
        try { await bulkAdjustPrice([...selected], pct); toast.success(`Prices ${pct >= 0 ? "+" : ""}${pct}%`); setSelected(new Set()); setBulkPctOpen(false); load(); }
        catch (e) { toast.error(e?.message || "Failed"); }
    };

    const handleSeed = async () => {
        const ok = await confirm({ title: "Seed default menu?", message: "Adds 40+ default Hotspot items (only if menu is empty)." });
        if (!ok) return;
        try { const r = await seedMenuItems(); toast.success(r.message || `Inserted ${r.inserted} items`); load(); }
        catch (e) { toast.error(e?.message || "Seed failed"); }
    };

    return (
        <div className="space-y-6" data-testid="admin-menu-manager">
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold">Menu Manager</h1>
                    <p className="text-sm text-muted-foreground">Add, edit, mark out of stock or popular.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {items.length === 0 && (
                        <button onClick={handleSeed} className="bg-white px-4 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-cream" data-testid="seed-menu-button">
                            <Database className="w-4 h-4" /> Seed default menu
                        </button>
                    )}
                    <button onClick={startNew} className="bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-brand-700" data-testid="add-menu-item-button">
                        <Plus className="w-4 h-4" /> Add item
                    </button>
                </div>
            </div>
            <SetupNotice />
            {!schemaOk && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-start gap-3" data-testid="v2-schema-notice">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold">Schema not applied yet</p>
                        <p className="text-amber-800">Run <code className="bg-amber-100 px-1 rounded">/app/database/schema_v3.sql</code> in Supabase SQL Editor.</p>
                    </div>
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {["All", ...categories.map((c) => c.name)].map((c) => (
                    <button key={c} onClick={() => setFilter(c)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 ${filter === c ? "bg-brand text-white" : "bg-white"}`}
                        data-testid={`menu-filter-${c.replace(/\s+/g, "-").toLowerCase()}`}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Bulk toolbar */}
            {selected.size > 0 && (
                <div className="bg-ink text-white rounded-2xl p-3 flex items-center gap-3 flex-wrap" data-testid="bulk-toolbar">
                    <span className="text-sm font-semibold">{selected.size} selected</span>
                    <button onClick={() => handleBulkInStock(true)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold" data-testid="bulk-instock">Mark available</button>
                    <button onClick={() => handleBulkInStock(false)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold" data-testid="bulk-out">Mark unavailable</button>
                    <button onClick={() => setBulkPctOpen(true)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-semibold" data-testid="bulk-price">Adjust price %</button>
                    <button onClick={handleBulkDelete} className="text-xs bg-brand hover:bg-brand-700 px-3 py-1.5 rounded-full font-semibold" data-testid="bulk-delete">Delete</button>
                    <button onClick={() => setSelected(new Set())} className="text-xs text-white/70 hover:text-white ml-auto">Clear</button>
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-2xl p-8 animate-pulse h-40" />
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center" data-testid="menu-empty-state">
                    <p className="font-display text-2xl font-extrabold">No items {filter !== "All" ? `in ${filter}` : "yet"}</p>
                    <p className="text-sm text-muted-foreground mt-1">Click &quot;Add item&quot; to get started.</p>
                </div>
            ) : (
                <>
                    <button onClick={selectAll} className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5 hover:text-brand" data-testid="select-all">
                        {selected.size === filtered.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        {selected.size === filtered.length ? "Deselect all" : "Select all"}
                    </button>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((it) => (
                            <div key={it.id} className={`bg-white rounded-2xl overflow-hidden shadow-soft relative ${selected.has(it.id) ? "ring-2 ring-brand" : ""}`} data-testid={`admin-item-${it.id}`}>
                                <button onClick={() => toggleSelect(it.id)} className="absolute top-2 right-2 z-10 bg-white/95 p-1.5 rounded-full" aria-label="Select" data-testid={`select-${it.id}`}>
                                    {selected.has(it.id) ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4" />}
                                </button>
                                <div className="aspect-[5/3] bg-warmBeige relative">
                                    {it.image_url ? (<img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>)}
                                    <div className="absolute top-2 left-2 flex gap-1.5">
                                        {it.is_popular && <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">Popular</span>}
                                        {!it.in_stock && <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-foreground px-2 py-0.5 rounded-full">Out</span>}
                                        {it.discount_price && <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full">Sale</span>}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-muted-foreground">{it.category}</p>
                                    <h3 className="font-semibold text-sm leading-tight mt-0.5">{it.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{it.description}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="font-display text-lg font-extrabold">
                                            {it.sizes ? `from ₹${Math.min(...it.sizes.map((s) => s.price))}` : (
                                                it.discount_price ? <>₹{it.discount_price} <span className="text-xs text-muted-foreground line-through">₹{it.price}</span></> : `₹${it.price}`
                                            )}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => startEdit(it)} className="p-1.5 rounded-full hover:bg-cream" data-testid={`edit-${it.id}`} aria-label="Edit"><Edit className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(it)} className="p-1.5 rounded-full hover:bg-cream text-brand" data-testid={`delete-${it.id}`} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {editing && <EditDialog initial={editing} onSave={handleSave} onClose={() => setEditing(null)} categories={categories} />}
            {bulkPctOpen && <BulkPctDialog onClose={() => setBulkPctOpen(false)} onApply={handleBulkPrice} />}
        </div>
    );
}

function EditDialog({ initial, onSave, onClose, categories }) {
    const [form, setForm] = useState(initial);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { publicUrl } = await uploadMenuImage(file);
            setForm((f) => ({ ...f, image_url: publicUrl }));
            toast.success("Image uploaded");
        } catch (err) { toast.error(err?.message || "Upload failed"); }
        finally { setUploading(false); }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[28px] p-6 w-full max-w-2xl my-8" data-testid="menu-edit-dialog">
                <div className="flex items-start justify-between">
                    <h3 className="font-display text-2xl font-extrabold">{form.id ? "Edit item" : "New item"}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream" aria-label="Close" data-testid="menu-edit-close"><X className="w-5 h-5" /></button>
                </div>
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" data-testid="form-name" /></Field>
                    <Field label="Category">
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" data-testid="form-category">
                            {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                        </select>
                    </Field>
                    <Field label="Description" full><textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" data-testid="form-description" /></Field>
                    <Field label="Price (skip if using sizes)">
                        <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input" data-testid="form-price" placeholder="e.g. 180" />
                    </Field>
                    <Field label="Discount price (optional)">
                        <input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className="input" data-testid="form-discount" placeholder="Lower than base price" />
                    </Field>
                    <Field label="Display position">
                        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input" data-testid="form-sort" />
                    </Field>
                    <Field label="Sizes (one per line)" full>
                        <textarea rows={3} value={form.sizesText} onChange={(e) => setForm({ ...form, sizesText: e.target.value })} className="input font-mono text-xs" placeholder={`Size: small, Price: 200\nSize: medium, Price: 280\nSize: large, Price: 400`} data-testid="form-sizes" />
                        <p className="text-xs text-muted-foreground mt-1">Format: <code>Size: name, Price: number</code> — leave empty to use base price.</p>
                    </Field>
                </div>

                <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Image</p>
                    <div className="flex items-start gap-3">
                        <div className="w-28 h-28 rounded-2xl bg-cream overflow-hidden flex items-center justify-center shrink-0">
                            {form.image_url ? <img src={form.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-7 h-7 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                            <label className="inline-flex items-center gap-2 bg-cream px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-warmBeige" data-testid="form-upload-trigger">
                                <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload image"}
                                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" data-testid="form-upload-input" />
                            </label>
                            <input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="or paste an image URL" className="input mt-2" data-testid="form-image-url" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-5 flex-wrap">
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} data-testid="form-in-stock" /> In stock
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} data-testid="form-is-popular" />
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Most popular
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-full font-semibold text-sm bg-cream hover:bg-warmBeige" data-testid="menu-cancel">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2.5 rounded-full font-semibold text-sm bg-brand text-white hover:bg-brand-700" data-testid="menu-save">Save</button>
                </div>
            </div>
            <style>{`.input{width:100%;padding:0.75rem 1rem;border-radius:1rem;background:#F5EFE6;outline:none}.input:focus{box-shadow:0 0 0 2px rgba(239,68,68,0.3)}`}</style>
        </div>
    );
}

function BulkPctDialog({ onClose, onApply }) {
    const [pct, setPct] = useState(10);
    return (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] p-6 w-full max-w-sm" data-testid="bulk-pct-dialog">
                <div className="flex items-start justify-between">
                    <h3 className="font-display text-2xl font-extrabold">Adjust prices</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>
                <label className="text-sm font-semibold mt-4 block">Percent change</label>
                <input type="number" value={pct} onChange={(e) => setPct(Number(e.target.value))} className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="bulk-pct-input" />
                <p className="text-xs text-muted-foreground mt-1">e.g. 10 = +10% ; -5 = 5% off</p>
                <div className="mt-5 flex gap-2 justify-end">
                    <button onClick={() => onApply(-Math.abs(pct))} className="px-4 py-2 rounded-full bg-cream hover:bg-warmBeige inline-flex items-center gap-1.5 text-sm font-semibold" data-testid="bulk-decrease">
                        <TrendingDown className="w-4 h-4" /> Decrease
                    </button>
                    <button onClick={() => onApply(Math.abs(pct))} className="px-4 py-2 rounded-full bg-brand text-white hover:bg-brand-700 inline-flex items-center gap-1.5 text-sm font-semibold" data-testid="bulk-increase">
                        <TrendingUp className="w-4 h-4" /> Increase
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, full, children }) {
    return (<div className={full ? "sm:col-span-2" : ""}><label className="text-sm font-semibold">{label}</label><div className="mt-1">{children}</div></div>);
}
