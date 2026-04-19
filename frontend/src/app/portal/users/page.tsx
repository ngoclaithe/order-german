'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user.service';
import { Users as UsersIcon, Shield, Phone, MapPin, Trash2, Edit3, Plus, X, Save } from 'lucide-react';
import { useState } from 'react';

export default function PortalUsers() {
    const queryClient = useQueryClient();
    const { data: users, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: UserService.getAll });
    const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
    const [formData, setFormData] = useState<any>({});

    const createMut = useMutation({ mutationFn: (d: any) => UserService.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setModal(null); } });
    const updateMut = useMutation({ mutationFn: (d: any) => UserService.update(d.id, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setModal(null); } });
    const deleteMut = useMutation({ mutationFn: (id: string) => UserService.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); } });

    const openCreate = () => { setFormData({ email: '', password: '', phone: '', address: '', role: 'USER' }); setModal('create'); };
    const openEdit = (user: any) => { setFormData({ id: user.id, email: user.email, phone: user.phone || '', address: user.address || '', role: user.role, whatsapp: user.whatsapp || '', telegram: user.telegram || '' }); setModal('edit'); };

    const roleColor = (role: string) => {
        if (role === 'ADMIN') return 'bg-rose-50 border-rose-200 text-rose-700';
        if (role === 'CASHIER') return 'bg-amber-50 border-amber-200 text-amber-700';
        return 'bg-gray-50 border-gray-200 text-gray-600';
    };

    const INPUT = "w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm";

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <UsersIcon size={32} className="text-emerald-600" /> User Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage accounts, assign roles (ADMIN, CASHIER, USER).</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95">
                    <Plus size={20} /> Add User
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-500">User</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Role</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Contact</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Orders</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Joined</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(Array.isArray(users) ? users : []).map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : user.role === 'CASHIER' ? 'bg-amber-100 text-amber-600' : 'bg-cyan-100 text-cyan-600'}`}>
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.email}</div>
                                                    <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${roleColor(user.role)}`}>
                                                {user.role === 'ADMIN' && <Shield size={12} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            {user.phone && <div className="flex items-center gap-2 text-gray-500 text-xs"><Phone size={12} /> {user.phone}</div>}
                                            {user.address && <div className="flex items-center gap-2 text-gray-500 text-xs"><MapPin size={12} /> {user.address}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono">{user._count?.orders || 0}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openEdit(user)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"><Edit3 size={14} /></button>
                                                <button onClick={() => { if (confirm('Delete this user?')) deleteMut.mutate(user.id); }} className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Create New User' : 'Edit User'}</h2>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); modal === 'create' ? createMut.mutate(formData) : updateMut.mutate(formData); }} className="space-y-4">
                            <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={INPUT} required /></div>
                            {modal === 'create' && <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
                                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={INPUT} required /></div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Phone</label>
                                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={INPUT} /></div>
                                <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={INPUT}>
                                        <option value="USER">USER</option><option value="CASHIER">CASHIER</option><option value="ADMIN">ADMIN</option>
                                    </select></div>
                            </div>
                            <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Address</label>
                                <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={INPUT} /></div>
                            {modal === 'edit' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-semibold text-gray-700 mb-1 block">WhatsApp</label>
                                        <input value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className={INPUT} /></div>
                                    <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Telegram</label>
                                        <input value={formData.telegram} onChange={e => setFormData({ ...formData, telegram: e.target.value })} className={INPUT} /></div>
                                </div>
                            )}
                            <button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white flex items-center justify-center gap-2 transition-colors">
                                <Save size={16} /> {modal === 'create' ? 'Create User' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
