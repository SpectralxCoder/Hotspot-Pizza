import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, X, Upload, Sparkles, Database, AlertTriangle } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listMenuItems, subscribeMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage, CATEGORIES, isV2SchemaApplied } from "../lib/menuService";
import { seedMenuItems } from "../lib/seed";
import { useConfirm } from "../contexts/ConfirmContext";
import { toast } from "sonner";

const EMPTY = { name: "", description: "", category: CATEGORIES[0], price: "", sizes: "", image_url: "", in_stock: true, is_popular: false, sort_order: 0 };

export default function AdminMenuManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState("All");
    const [schemaOk, setSchemaOk] = useState(true);
    const confirm = useConfirm();

    const load = async () => {
        try {
            const data = await listMenuItems();
            setItems(data);
        } catch (e) {
            console.warn("listMenuItems failed:", e?.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        isV2SchemaApplied().then(setSchemaOk);
        load();
        const u = subscribeMenuItems(load);
        return u;
    }, []);

    const startNew = () => setEditing({ ...EMPTY });
    const startEdit = (it) => setEditing({
        ...it,
        sizes: it.sizes ? JSON.stringify(it.sizes) : "",
        price: it.price ?? "",
    });
    const close = () => setEditing(null);

    const handleSave = async (payload) => {
        try {
            const isPizza = (payload.sizes || "").trim().length > 0;
            const body = {
                name: payload.name.trim(),
                description: payload.description?.trim() || null,
                category: payload.category,
                price: isPizza ? null : Number(payload.price) || 0,
                sizes: isPizza ? JSON.parse(payload.sizes) : null,
                image_url: payload.image_url || null,
                in_stock: !!payload.in_stock,
                is_popular: !!payload.is_popular,
                sort_order: Number(payload.sort_order) || 0,
            };
            if (payload.id) await updateMenuItem(payload.id, body);
            else await createMenuItem(body);
            toast.success(payload.id ? "Item updated" : "Item created");
            close();
            load();
        } catch (e) {
            toast.error(e?.message || "Save failed");
        }
    };

    const handleDelete = async (it) => {
        const ok = await confirm({ title: "Delete menu item?", message: `"${it.name}" will be removed.`, confirmText: "Delete", tone: "danger" });
        if (!ok) return;
        try {
            await deleteMenuItem(it.id);
            toast.success("Deleted");
            load();
        } catch (e) {
            toast.error(e?.message || "Delete failed");
        }
    };

    const handleSeed = async () => {
        const ok = await confirm({ title: "Seed default menu?", message: "Adds 40+ default Hotspot items (only if menu is empty)." });
        if (!ok) return;
        try {
            const r = await seedMenuItems();
            toast.success(r.message || `Inserted ${r.inserted} items`);
            load();
        } catch (e) {
            toast.error(e?.message || "Seed failed");
        }
    };

    const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

    return (
        <div className="space-y-6" data-testid="admin-menu-manager">
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold">Menu Manager</h1>
                    <p className="text-sm text-muted-foreground">Add, edit, mark out of stock or popular.</p>
                </div>
                <div className="flex items-center gap-2">
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
                        <p className="font-semibold">Schema v2 not applied yet</p>
                        <p className="text-amber-800">
                            Open Supabase → SQL Editor and run <code className="bg-amber-100 px-1 rounded">/app/database/schema_v2.sql</code>. Until then this page can&apos;t persist menu items.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {["All", ...CATEGORIES].map((c) => (
                    <button key={c} onClick={() => setFilter(c)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold ${filter === c ? "bg-brand text-white" : "bg-white"}`}
                        data-testid={`menu-filter-${c.replace(/\s+/g, "-").toLowerCase()}`}>
                        {c}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl p-8 animate-pulse h-40" />
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center" data-testid="menu-empty-state">
                    <p className="font-display text-2xl font-extrabold">No items {filter !== "All" ? `in ${filter}` : "yet"}</p>
                    <p className="text-sm text-muted-foreground mt-1">Click &quot;Add item&quot; or &quot;Seed default menu&quot; to get started.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((it) => (
                        <div key={it.id} className="bg-white rounded-2xl overflow-hidden shadow-soft" data-testid={`admin-item-${it.id}`}>
                            <div className="aspect-[5/3] bg-warmBeige relative">
                                {it.image_url ? (
                                    <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>
                                )}
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                    {it.is_popular && <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">Popular</span>}
                                    {!it.in_stock && <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-foreground px-2 py-0.5 rounded-full">Out</span>}
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-muted-foreground">{it.category}</p>
                                <h3 className="font-semibold text-sm leading-tight mt-0.5">{it.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{it.description}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="font-display text-lg font-extrabold">
                                        {it.sizes ? `from ₹${Math.min(...it.sizes.map((s) => s.price))}` : `₹${it.price}`}
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
            )}

            {editing && <EditDialog initial={editing} onSave={handleSave} onClose={close} />}
        </div>
    );
}

function EditDialog({ initial, onSave, onClose }) {
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
        } catch (err) {
            toast.error(err?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="menu-edit-dialog">
                <div className="flex items-start justify-between">
                    <h3 className="font-display text-2xl font-extrabold">{form.id ? "Edit item" : "New item"}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream" aria-label="Close" data-testid="menu-edit-close"><X className="w-5 h-5" /></button>
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" data-testid="form-name" /></Field>
                    <Field label="Category">
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" data-testid="form-category">
                            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                    </Field>
                    <Field label="Description" full><textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" data-testid="form-description" /></Field>
                    <Field label="Price (leave empty if using sizes)"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" data-testid="form-price" /></Field>
                    <Field label="Sort order"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input" data-testid="form-sort" /></Field>
                    <Field label='Sizes JSON (e.g. [{"size":"Regular","price":180}])' full>
                        <textarea rows={2} value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="input font-mono text-xs" data-testid="form-sizes" />
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

                <div className="mt-4 flex items-center gap-5">
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="rounded" data-testid="form-in-stock" />
                        In stock
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="rounded" data-testid="form-is-popular" />
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

function Field({ label, full, children }) {
    return (
        <div className={full ? "sm:col-span-2" : ""}>
            <label className="text-sm font-semibold">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}
