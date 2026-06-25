import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import SetupNotice from "../components/SetupNotice";
import { listCategories, createCategory, updateCategory, deleteCategory, subscribeCategories } from "../lib/menuService";
import { useConfirm } from "../contexts/ConfirmContext";
import { toast } from "sonner";

export default function AdminCategories() {
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const confirm = useConfirm();

    const load = async () => {
        try {
            const data = await listCategories();
            setCats(data);
        } catch { setCats([]); } finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        const u = subscribeCategories(load);
        return u;
    }, []);

    const handleDelete = async (c) => {
        const ok = await confirm({ title: "Delete category?", message: `"${c.name}" — only allowed if empty.`, confirmText: "Delete", tone: "danger" });
        if (!ok) return;
        try { await deleteCategory(c.id, c.name); toast.success("Deleted"); load(); }
        catch (e) { toast.error(e?.message || "Cannot delete"); }
    };

    const handleSave = async (form) => {
        try {
            if (form.id) await updateCategory(form.id, { name: form.name.trim(), sort_order: Number(form.sort_order) || 0 });
            else await createCategory({ name: form.name.trim(), sort_order: Number(form.sort_order) || 0 });
            toast.success(form.id ? "Updated" : "Created");
            setEditing(null);
            load();
        } catch (e) { toast.error(e?.message || "Save failed"); }
    };

    return (
        <div className="space-y-6" data-testid="admin-categories">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold">Categories</h1>
                    <p className="text-sm text-muted-foreground">Organize and reorder menu sections.</p>
                </div>
                <button onClick={() => setEditing({ name: "", sort_order: cats.length })} className="bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-brand-700" data-testid="add-category-button">
                    <Plus className="w-4 h-4" /> Add category
                </button>
            </div>
            <SetupNotice />

            {loading ? (
                <div className="bg-white rounded-2xl h-32 animate-pulse" />
            ) : cats.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center" data-testid="categories-empty">
                    <p className="font-display text-2xl font-extrabold">No categories yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create one to organize your menu.</p>
                </div>
            ) : (
                <ul className="bg-white rounded-2xl shadow-soft divide-y divide-warmBeige">
                    {cats.map((c) => (
                        <li key={c.id} className="flex items-center justify-between p-4" data-testid={`category-row-${c.id}`}>
                            <div>
                                <p className="font-semibold">{c.name}</p>
                                <p className="text-xs text-muted-foreground">Position {c.sort_order}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setEditing(c)} className="p-2 rounded-full hover:bg-cream" data-testid={`category-edit-${c.id}`} aria-label="Edit"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(c)} className="p-2 rounded-full hover:bg-cream text-brand" data-testid={`category-delete-${c.id}`} aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {editing && (
                <CatDialog initial={editing} onClose={() => setEditing(null)} onSave={handleSave} />
            )}
        </div>
    );
}

function CatDialog({ initial, onClose, onSave }) {
    const [f, setF] = useState(initial);
    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] p-6 w-full max-w-md">
                <div className="flex items-start justify-between">
                    <h3 className="font-display text-2xl font-extrabold">{f.id ? "Edit category" : "New category"}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream" aria-label="Close" data-testid="category-dialog-close"><X className="w-5 h-5" /></button>
                </div>
                <div className="mt-5 space-y-4">
                    <div>
                        <label className="text-sm font-semibold">Name</label>
                        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="category-name-input" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Display position</label>
                        <input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30" data-testid="category-sort-input" />
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-full font-semibold text-sm bg-cream hover:bg-warmBeige">Cancel</button>
                    <button onClick={() => onSave(f)} disabled={!f.name?.trim()} className="px-5 py-2.5 rounded-full font-semibold text-sm bg-brand text-white hover:bg-brand-700 disabled:opacity-50" data-testid="category-save">Save</button>
                </div>
            </div>
        </div>
    );
}
