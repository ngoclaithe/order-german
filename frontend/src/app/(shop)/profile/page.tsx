'use client';

import { User, LogOut, FileText, MapPin, KeyRound, Mail, Plus, Trash2, Star, X } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { AddressService } from '@/services/address.service';
import { useLangStore } from '@/store/lang.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ProfilePage() {
    const { user, isAuthenticated, login, logout } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLangStore();
    const [mounted, setMounted] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ title: string; desc?: string; type: 'error' | 'success' } | null>(null);

    // Change password state
    const [showChangePw, setShowChangePw] = useState(false);
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [changePwLoading, setChangePwLoading] = useState(false);

    // Address state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addrLabel, setAddrLabel] = useState('');
    const [addrAddress, setAddrAddress] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrDefault, setAddrDefault] = useState(false);

    // Edit profile state
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [editWhatsapp, setEditWhatsapp] = useState(user?.whatsapp || '');
    const [editTelegram, setEditTelegram] = useState(user?.telegram || '');

    const qc = useQueryClient();

    useEffect(() => { setMounted(true); }, []);

    const { data: addresses = [] } = useQuery({
        queryKey: ['my-addresses'],
        queryFn: AddressService.getAddresses,
        enabled: isAuthenticated && mounted,
    });

    const addrList = Array.isArray(addresses) ? addresses : [];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setToastMsg(null);
        try {
            const data = await AuthService.login({ email, password });
            login(data);
        } catch (err: any) {
            setToastMsg({ title: t('Login failed', 'Anmeldung fehlgeschlagen'), desc: err.response?.data?.message || 'Invalid credentials', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePw = async () => {
        if (!oldPw || !newPw) return;
        setChangePwLoading(true);
        try {
            await AuthService.changePassword(oldPw, newPw);
            setToastMsg({ title: t('Password changed!', 'Passwort geändert!'), type: 'success' });
            setShowChangePw(false);
            setOldPw(''); setNewPw('');
        } catch (err: any) {
            setToastMsg({ title: t('Failed', 'Fehlgeschlagen'), desc: err?.response?.data?.message || 'Error', type: 'error' });
        } finally {
            setChangePwLoading(false);
        }
    };

    const handleEditProfile = async () => {
        try {
            await api.patch(`/users/${user?.id}`, { phone: editPhone, whatsapp: editWhatsapp, telegram: editTelegram });
            // Update local store
            if (user) login({ ...user, phone: editPhone, whatsapp: editWhatsapp, telegram: editTelegram });
            setToastMsg({ title: t('Profile updated!', 'Profil aktualisiert!'), type: 'success' });
            setShowEditProfile(false);
        } catch (err: any) {
            setToastMsg({ title: t('Failed', 'Fehlgeschlagen'), desc: err?.response?.data?.message || 'Error', type: 'error' });
        }
    };

    const handleCreateAddress = async () => {
        if (!addrLabel || !addrAddress || !addrPhone) return;
        try {
            await AddressService.createAddress({ label: addrLabel, address: addrAddress, phone: addrPhone, isDefault: addrDefault });
            qc.invalidateQueries({ queryKey: ['my-addresses'] });
            setShowAddressForm(false);
            setAddrLabel(''); setAddrAddress(''); setAddrPhone(''); setAddrDefault(false);
        } catch { }
    };

    const showToast = (title: string, type: 'success' | 'error') => {
        setToastMsg({ title, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    if (!mounted) return <main className="min-h-screen bg-[#0f0f0f]" />;

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen pb-32 text-white relative flex flex-col justify-center px-6 isolate">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] -z-10" />

                {toastMsg && (
                    <div className="absolute top-10 left-6 right-6 z-50 animate-in slide-in-from-top-2">
                        <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-4 ${toastMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                            <div>
                                <h3 className="font-bold">{toastMsg.title}</h3>
                                {toastMsg.desc && <p className="text-sm opacity-80 mt-1">{toastMsg.desc}</p>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-dark p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full" />
                    <h1 className="text-3xl font-extrabold mb-2">{t('Welcome Back', 'Willkommen zurück')}</h1>
                    <p className="text-white/50 mb-8">{t('Sign in to track orders and save your favorites.', 'Melde dich an, um Bestellungen zu verfolgen.')}</p>

                    <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80">{t('Email', 'E-Mail')}</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                    placeholder="name@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80">{t('Password', 'Passwort')}</label>
                            <div className="relative">
                                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                                    placeholder="••••••••" minLength={4} />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold mt-6 shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50 active:scale-95 transition-all">
                            {isLoading ? t('Signing In...', 'Anmelden...') : t('Sign In', 'Anmelden')}
                        </button>
                    </form>

                    <button onClick={() => setForgotMode(true)} className="w-full text-center text-sm text-white/40 hover:text-emerald-400 mt-4 transition-colors">
                        {t('Forgot Password?', 'Passwort vergessen?')}
                    </button>

                    {forgotMode && (
                        <div className="mt-4 p-4 glass-dark rounded-2xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="font-bold text-sm">{t('Reset Password', 'Passwort zurücksetzen')}</h3>
                            <p className="text-xs text-white/50">{t('We will send a new password to your email.', 'Wir senden ein neues Passwort an deine E-Mail.')}</p>
                            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-sm focus:ring-2 focus:ring-cyan-400 outline-none" />
                            <div className="flex gap-2">
                                <button onClick={async () => {
                                    if (!forgotEmail) return;
                                    setForgotLoading(true);
                                    try { await AuthService.forgotPassword(forgotEmail); setToastMsg({ title: t('Password sent!', 'Passwort gesendet!'), desc: t('Check your email.', 'Überprüfe deine E-Mail.'), type: 'success' }); setForgotMode(false); setForgotEmail(''); }
                                    catch (err: any) { setToastMsg({ title: t('Failed', 'Fehlgeschlagen'), desc: err?.response?.data?.message || 'Error', type: 'error' }); }
                                    finally { setForgotLoading(false); }
                                }} disabled={forgotLoading || !forgotEmail}
                                    className="flex-1 h-10 rounded-xl bg-cyan-500 text-black font-bold text-sm disabled:opacity-50 active:scale-95">{forgotLoading ? '...' : t('Send', 'Senden')}</button>
                                <button onClick={() => { setForgotMode(false); setForgotEmail(''); }}
                                    className="h-10 px-4 rounded-xl bg-white/10 text-white/60 text-sm">{t('Cancel', 'Abbrechen')}</button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 text-center text-sm text-white/50">
                        {t("Don't have an account?", 'Noch kein Konto?')}{' '}
                        <Link href="/register" className="text-emerald-400 font-bold hover:underline">{t('Register', 'Registrieren')}</Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-32 text-white relative overflow-y-auto no-scrollbar">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

            {toastMsg && (
                <div className="fixed top-6 left-6 right-6 z-50 animate-in slide-in-from-top-2">
                    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl ${toastMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                        <h3 className="font-bold">{toastMsg.title}</h3>
                        {toastMsg.desc && <p className="text-sm opacity-80 mt-1">{toastMsg.desc}</p>}
                    </div>
                </div>
            )}

            <div className="px-6 pt-16 pb-6 relative z-10">
                {/* Profile Card */}
                <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]" />
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 shrink-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 p-1">
                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-2xl font-bold">
                                {user?.email[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 z-10 min-w-0">
                            <h1 className="text-2xl font-extrabold tracking-tight truncate">{user?.email}</h1>
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 mt-2">
                                {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'CASHIER' ? t('Cashier', 'Kassierer') : 'Member'}
                            </span>
                        </div>
                    </div>
                    {/* Contact Info */}
                    <div className="mt-4 space-y-1.5 pl-1">
                        {user?.phone && (
                            <div className="flex items-center gap-2 text-sm text-white/50">
                                <span className="text-white/30">📞</span> {user.phone}
                            </div>
                        )}
                        {user?.whatsapp && (
                            <div className="flex items-center gap-2 text-sm text-white/50">
                                <span className="text-emerald-400/60">💬</span> {user.whatsapp}
                            </div>
                        )}
                        {user?.telegram && (
                            <div className="flex items-center gap-2 text-sm text-white/50">
                                <span className="text-cyan-400/60">✈️</span> {user.telegram}
                            </div>
                        )}
                    </div>
                    {/* Edit Profile */}
                    <button onClick={() => setShowEditProfile(!showEditProfile)} className="mt-3 text-xs text-white/40 hover:text-emerald-400 transition-colors">
                        {showEditProfile ? t('Close', 'Schließen') : t('Edit Profile', 'Profil bearbeiten')} ✏️
                    </button>
                    {showEditProfile && (
                        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                            <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder={t('Phone', 'Telefon')}
                                className="w-full bg-white/5 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-emerald-400" />
                            <input type="text" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} placeholder="WhatsApp"
                                className="w-full bg-white/5 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-emerald-400" />
                            <input type="text" value={editTelegram} onChange={e => setEditTelegram(e.target.value)} placeholder="Telegram"
                                className="w-full bg-white/5 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-emerald-400" />
                            <button onClick={handleEditProfile} className="w-full h-9 rounded-lg bg-emerald-500 text-black font-bold text-sm active:scale-95">
                                {t('Save', 'Speichern')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Menu Items */}
                <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-bold tracking-tight mb-4 px-2">{t('Account', 'Konto')}</h2>

                    <Link href="/orders">
                        <div className="glass-dark rounded-2xl p-4 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer border border-white/5 mb-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400"><FileText size={20} /></div>
                                <span className="font-semibold text-lg">{t('Order History', 'Bestellverlauf')}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Locations */}
                    <div className="glass-dark rounded-2xl p-4 border border-white/5 mb-3">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400"><MapPin size={20} /></div>
                                <span className="font-semibold text-lg">{t('My Locations', 'Meine Standorte')}</span>
                            </div>
                            <button onClick={() => setShowAddressForm(true)} className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 active:scale-90 transition-all">
                                <Plus size={16} />
                            </button>
                        </div>

                        {addrList.length === 0 && !showAddressForm && (
                            <p className="text-white/40 text-sm pl-14">{t('No addresses yet. Add one!', 'Noch keine Adressen. Füge eine hinzu!')}</p>
                        )}

                        <div className="space-y-2 pl-14">
                            {addrList.map((addr: any) => (
                                <div key={addr.id} className={`flex items-start justify-between p-3 rounded-xl border transition-all ${addr.isDefault ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-white/5 bg-white/5'}`}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{addr.label}</span>
                                            {addr.isDefault && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">Default</span>}
                                        </div>
                                        <p className="text-white/50 text-xs mt-0.5 truncate">{addr.address}</p>
                                        <p className="text-white/40 text-[10px]">{addr.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        {!addr.isDefault && (
                                            <button onClick={async () => { await AddressService.setDefault(addr.id); qc.invalidateQueries({ queryKey: ['my-addresses'] }); }}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-amber-400" title="Set default">
                                                <Star size={14} />
                                            </button>
                                        )}
                                        <button onClick={async () => { await AddressService.deleteAddress(addr.id); qc.invalidateQueries({ queryKey: ['my-addresses'] }); }}
                                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-400">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {showAddressForm && (
                            <div className="mt-3 ml-14 p-3 rounded-xl border border-white/10 bg-white/5 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <input value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder={t('Label (Home, Office...)', 'Name (Zuhause, Büro...)')}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-emerald-400" />
                                <input value={addrAddress} onChange={e => setAddrAddress(e.target.value)} placeholder={t('Full address', 'Vollständige Adresse')}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-emerald-400" />
                                <input value={addrPhone} onChange={e => setAddrPhone(e.target.value)} placeholder={t('Phone number', 'Telefonnummer')}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-emerald-400" />
                                <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                                    <input type="checkbox" checked={addrDefault} onChange={e => setAddrDefault(e.target.checked)} className="accent-emerald-400" />
                                    {t('Set as default', 'Als Standard festlegen')}
                                </label>
                                <div className="flex gap-2">
                                    <button onClick={handleCreateAddress} className="flex-1 h-8 rounded-lg bg-emerald-500 text-black font-bold text-xs active:scale-95">{t('Save', 'Speichern')}</button>
                                    <button onClick={() => setShowAddressForm(false)} className="h-8 px-3 rounded-lg bg-white/10 text-white/60 text-xs">{t('Cancel', 'Abbrechen')}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Change Password */}
                    <div className="glass-dark rounded-2xl p-4 border border-white/5 mb-3">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowChangePw(!showChangePw)}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-violet-400"><KeyRound size={20} /></div>
                                <span className="font-semibold text-lg">{t('Change Password', 'Passwort ändern')}</span>
                            </div>
                        </div>
                        {showChangePw && (
                            <div className="mt-3 ml-14 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder={t('Current password', 'Aktuelles Passwort')}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-violet-400" />
                                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={t('New password', 'Neues Passwort')} minLength={4}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg h-9 px-3 text-sm outline-none focus:border-violet-400" />
                                <button onClick={handleChangePw} disabled={changePwLoading || !oldPw || !newPw}
                                    className="w-full h-9 rounded-lg bg-violet-500 text-white font-bold text-sm disabled:opacity-50 active:scale-95">
                                    {changePwLoading ? '...' : t('Update Password', 'Passwort aktualisieren')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sign Out */}
                    <div
                        onClick={() => { AuthService.logout().catch(() => { }); logout(); }}
                        className="glass-dark rounded-2xl p-4 flex justify-between items-center hover:bg-rose-500/10 transition-colors cursor-pointer border border-white/5 mt-8 border-rose-500/20 text-rose-400"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center"><LogOut size={20} /></div>
                            <span className="font-semibold text-lg">{t('Sign Out', 'Abmelden')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
