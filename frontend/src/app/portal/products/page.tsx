'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuService } from '@/services/menu.service';
import { Plus, Edit3, Trash2, X, Save, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import api from '@/lib/api';

const parsePrice = (val: string) => parseFloat(val.replace(',', '.')) || 0;

export default function PortalProducts() {
    const qc = useQueryClient();
    const { data: categories, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: MenuService.getAdminCategories });

    const [modal, setModal] = useState<string | null>(null);
    const [form, setForm] = useState<any>({});
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(f => formData.append('files', f));
            const res: any = await api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const urls = (Array.isArray(res) ? res : res?.data || []).map((r: any) => r.url);
            setUploadedImages(prev => [...prev, ...urls]);
            if (urls.length > 0) setForm((prev: any) => ({ ...prev, imageUrl: prev.imageUrl || urls[0] }));
        } catch (e) { console.error('Upload failed', e); }
        finally { setUploading(false); }
    };

    const createCat = useMutation({ mutationFn: (d: any) => MenuService.createCategory(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const updateCat = useMutation({ mutationFn: (d: any) => MenuService.updateCategory(d.id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const deleteCat = useMutation({ mutationFn: (id: string) => MenuService.deleteCategory(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });
    const createItem = useMutation({ mutationFn: (d: any) => MenuService.createItem(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const updateItem = useMutation({ mutationFn: (d: any) => MenuService.updateItem(d.id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const deleteItem = useMutation({ mutationFn: (id: string) => MenuService.deleteItem(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });
    const toggleActive = useMutation({ mutationFn: (d: any) => MenuService.updateItem(d.id, { isActive: d.isActive }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });
    const createTG = useMutation({ mutationFn: (d: any) => MenuService.createToppingGroup(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const updateTG = useMutation({ mutationFn: (d: any) => MenuService.updateToppingGroup(d.id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const deleteTG = useMutation({ mutationFn: (id: string) => MenuService.deleteToppingGroup(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });
    const createTO = useMutation({ mutationFn: (d: any) => MenuService.createToppingOption(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const updateTO = useMutation({ mutationFn: (d: any) => MenuService.updateToppingOption(d.id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); } });
    const deleteTO = useMutation({ mutationFn: (id: string) => MenuService.deleteToppingOption(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });

    const openModal = (type: string, data: any = {}) => { setForm(data); setModal(type); setUploadedImages(data.imageUrl ? [data.imageUrl] : []); };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu Products</h1>
                    <p className="text-gray-500 mt-1">Manage categories, items, toppings and availability.</p>
                </div>
                <button onClick={() => openModal('create-cat', { name: '' })} className="flex items-center gap-2 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all">
                    <Plus size={18} /> New Category
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
            ) : !categories || categories.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-200">No products found.</div>
            ) : (
                <div className="space-y-8">
                    {categories.map((cat: any) => (
                        <div key={cat.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                                    {cat.name}
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{cat.items?.length || 0} items</span>
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('create-item', { name: '', description: '', price: 0, imageUrl: '', categoryId: cat.id })} className="text-xs font-bold px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white flex items-center gap-1"><Plus size={14} /> Item</button>
                                    <button onClick={() => openModal('edit-cat', { id: cat.id, name: cat.name })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500"><Edit3 size={14} /></button>
                                    <button onClick={() => { if (confirm('Delete category + all items?')) deleteCat.mutate(cat.id); }} className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {cat.items?.map((item: any) => (
                                    <div key={item.id} className={`bg-white border rounded-xl transition-colors shadow-sm ${item.isActive ? 'border-gray-200' : 'border-rose-200 opacity-60'}`}>
                                        <div className="flex items-center gap-4 p-4">
                                            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                {item.imageUrl ? <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🍔</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold truncate text-gray-900">{item.name}</h3>
                                                    {!item.isActive && <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-200">INACTIVE</span>}
                                                </div>
                                                <p className="text-emerald-600 font-mono font-bold text-sm">€{item.price.toFixed(2)}</p>
                                                <p className="text-gray-400 text-xs truncate">{item.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => toggleActive.mutate({ id: item.id, isActive: !item.isActive })} className={`p-1.5 rounded-md transition-colors ${item.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'}`} title={item.isActive ? 'Deactivate' : 'Activate'}>
                                                    {item.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <button onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-500">
                                                    {expandedItem === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </button>
                                                <button onClick={() => openModal('edit-item', { id: item.id, name: item.name, description: item.description || '', price: item.price, imageUrl: item.imageUrl || '', categoryId: item.categoryId })} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md"><Edit3 size={14} /></button>
                                                <button onClick={() => { if (confirm('Delete item?')) deleteItem.mutate(item.id); }} className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-md"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-gray-50/50">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-gray-600">Topping Groups</h4>
                                                    <button onClick={() => openModal('create-tg', { name: '', menuItemId: item.id, requiresSelection: false, multipleSelection: true })} className="text-[10px] font-bold px-2 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-white flex items-center gap-1"><Plus size={10} /> Group</button>
                                                </div>
                                                {item.toppingGroups?.length === 0 && <p className="text-xs text-gray-400">No topping groups. Add one above.</p>}
                                                {item.toppingGroups?.map((tg: any) => (
                                                    <div key={tg.id} className="bg-white rounded-lg p-3 space-y-2 border border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-sm font-bold text-gray-900">{tg.name}</span>
                                                                <span className="text-[10px] text-gray-400 ml-2">{tg.requiresSelection ? 'Required' : 'Optional'} · {tg.multipleSelection ? 'Multi' : 'Single'}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => openModal('create-to', { name: '', price: 0, toppingGroupId: tg.id })} className="text-[10px] font-bold px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white"><Plus size={10} /></button>
                                                                <button onClick={() => openModal('edit-tg', { id: tg.id, name: tg.name, requiresSelection: tg.requiresSelection, multipleSelection: tg.multipleSelection })} className="p-1 text-gray-400 hover:text-gray-700"><Edit3 size={12} /></button>
                                                                <button onClick={() => { if (confirm('Delete group?')) deleteTG.mutate(tg.id); }} className="p-1 text-rose-400 hover:text-rose-600"><Trash2 size={12} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {tg.options?.map((opt: any) => (
                                                                <div key={opt.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2 py-1 rounded text-xs group">
                                                                    <span className="text-gray-700">{opt.name}</span>
                                                                    <span className="text-emerald-600 font-mono">+€{opt.price.toFixed(2)}</span>
                                                                    <button onClick={() => openModal('edit-to', { id: opt.id, name: opt.name, price: opt.price })} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700"><Edit3 size={10} /></button>
                                                                    <button onClick={() => { if (confirm('Delete?')) deleteTO.mutate(opt.id); }} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600"><Trash2 size={10} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ======== MODAL ======== */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 capitalize">{modal.replace(/-/g, ' ')}</h2>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault();
                            if (modal === 'create-cat') createCat.mutate(form);
                            else if (modal === 'edit-cat') updateCat.mutate(form);
                            else if (modal === 'create-item') createItem.mutate(form);
                            else if (modal === 'edit-item') updateItem.mutate(form);
                            else if (modal === 'create-tg') createTG.mutate(form);
                            else if (modal === 'edit-tg') updateTG.mutate(form);
                            else if (modal === 'create-to') createTO.mutate(form);
                            else if (modal === 'edit-to') updateTO.mutate(form);
                        }} className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Name</label>
                                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" required />
                            </div>
                            {(modal === 'create-item' || modal === 'edit-item') && (
                                <>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                                        <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full h-16 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none resize-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Price (€)</label>
                                        <input type="text" inputMode="decimal" value={form.price ?? ''} onChange={e => setForm({ ...form, price: parsePrice(e.target.value) })} placeholder="0.00" className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Original Price (€) <span className="text-gray-400 font-normal">optional</span></label>
                                        <input type="text" inputMode="decimal" value={form.originalPrice ?? ''} onChange={e => setForm({ ...form, originalPrice: parsePrice(e.target.value) || null })} placeholder="0.00" className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Product Images</label>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleImageUpload(e.target.files)} className="hidden" />
                                        <div onClick={() => fileInputRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-emerald-500'); }}
                                            onDragLeave={e => { e.currentTarget.classList.remove('border-emerald-500'); }}
                                            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-emerald-500'); handleImageUpload(e.dataTransfer.files); }}
                                            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                                            {uploading ? <span className="text-sm text-gray-400 animate-pulse">Uploading...</span> : (
                                                <><Upload size={20} className="text-gray-400" /><span className="text-xs text-gray-400">Click or drag images here</span></>
                                            )}
                                        </div>
                                        {uploadedImages.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {uploadedImages.map((url, i) => (
                                                    <div key={i} className="relative group">
                                                        <img src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                                                        <button onClick={e => { e.preventDefault(); const newImgs = uploadedImages.filter((_, j) => j !== i); setUploadedImages(newImgs); if (form.imageUrl === url) setForm({ ...form, imageUrl: newImgs[0] || '' }); }} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100"><X size={8} /></button>
                                                        {form.imageUrl === url && <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-[8px] text-white text-center rounded-b-lg">Main</div>}
                                                        {form.imageUrl !== url && <button onClick={e => { e.preventDefault(); setForm({ ...form, imageUrl: url }); }} className="absolute bottom-0 left-0 right-0 bg-gray-900/60 text-[8px] text-white text-center rounded-b-lg opacity-0 group-hover:opacity-100 cursor-pointer">Set Main</button>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            {(modal === 'create-tg' || modal === 'edit-tg') && (
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={form.requiresSelection || false} onChange={e => setForm({ ...form, requiresSelection: e.target.checked })} className="accent-emerald-500" />Required</label>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={form.multipleSelection ?? true} onChange={e => setForm({ ...form, multipleSelection: e.target.checked })} className="accent-emerald-500" />Multiple</label>
                                </div>
                            )}
                            {(modal === 'create-to' || modal === 'edit-to') && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Extra Price (€)</label>
                                    <input type="text" inputMode="decimal" value={form.price ?? ''} onChange={e => setForm({ ...form, price: parsePrice(e.target.value) })} placeholder="0.00" className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none" required />
                                </div>
                            )}
                            <button type="submit" className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white flex items-center justify-center gap-2 transition-colors text-sm">
                                <Save size={14} /> Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
