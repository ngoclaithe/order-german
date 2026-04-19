'use client';

import { useCartStore } from '@/store/cart.store';
import { Minus, Plus, Trash2, ArrowRight, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/lang.store';
import { useQuery } from '@tanstack/react-query';
import { AddressService } from '@/services/address.service';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const { t } = useLangStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [isProcessing, setIsProcessing] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ title: string, desc?: string, type: 'error' | 'success' } | null>(null);
    const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [manualAddress, setManualAddress] = useState('');
    const [manualPhone, setManualPhone] = useState('');

    const { data: rawAddresses = [] } = useQuery({
        queryKey: ['my-addresses'],
        queryFn: AddressService.getAddresses,
        enabled: isAuthenticated && mounted,
    });
    const addrList: any[] = Array.isArray(rawAddresses) ? rawAddresses : [];
    // Auto-select default
    useEffect(() => {
        if (addrList.length > 0 && !selectedAddrId) {
            const def = addrList.find((a: any) => a.isDefault) || addrList[0];
            setSelectedAddrId(def.id);
        }
    }, [addrList]);
    const selectedAddr = addrList.find((a: any) => a.id === selectedAddrId);

    if (!mounted) return <main className="min-h-screen bg-[#0f0f0f]" />;

    const openConfirmModal = () => {
        if (!isAuthenticated) {
            setToastMsg({ title: 'Authentication Required', desc: 'Please sign in to place an order.', type: 'error' });
            setTimeout(() => router.push('/profile'), 2000);
            return;
        }
        // Pre-fill manual fields from user profile
        setManualAddress(user?.address || '');
        setManualPhone(user?.phone || '');
        setShowConfirm(true);
    };

    const getFinalAddress = () => selectedAddr?.address || manualAddress;
    const getFinalPhone = () => selectedAddr?.phone || manualPhone;

    const handleConfirmOrder = async () => {
        const addr = getFinalAddress();
        const phone = getFinalPhone();
        if (!addr || !phone) return;

        setIsProcessing(true);
        try {
            const orderPayload = {
                guestName: user?.email,
                guestAddress: addr,
                guestPhone: phone,
                items: items.map(i => ({
                    menuItemId: i.menuItem.id,
                    quantity: i.quantity,
                    price: i.menuItem.price,
                    toppings: i.selectedToppings.map(t => ({
                        toppingOptionId: t.id,
                        price: t.price
                    }))
                }))
            };

            await api.post('/orders', orderPayload);
            setShowConfirm(false);
            setToastMsg({ title: 'Order Placed Successfully!', desc: 'Your authentic German food is on the way.', type: 'success' });
            clearCart();
            setTimeout(() => router.push('/orders'), 2500);

        } catch (err: any) {
            setToastMsg({ title: 'Checkout Failed', desc: err.response?.data?.message || 'Something went wrong', type: 'error' });
            setTimeout(() => setToastMsg(null), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen pb-32 text-white relative overflow-y-auto no-scrollbar">
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

            {toastMsg && (
                <div className={`fixed top-6 left-6 right-6 z-50 p-4 rounded-2xl border ${toastMsg.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50' : 'bg-rose-900/90 border-rose-500/50'} backdrop-blur-xl animate-fade-in-up`}>
                    <h3 className="font-bold">{toastMsg.title}</h3>
                    {toastMsg.desc && <p className="text-sm opacity-80 mt-1">{toastMsg.desc}</p>}
                </div>
            )}

            {/* ===== CONFIRM ORDER MODAL ===== */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowConfirm(false)}>
                    <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{t('Confirm Order', 'Bestellung bestätigen')}</h2>
                            <button onClick={() => setShowConfirm(false)} className="text-white/40 hover:text-white text-xl">✕</button>
                        </div>

                        {/* Location Selection */}
                        <div>
                            <label className="text-sm font-bold text-white/80 mb-2 flex items-center gap-2">
                                <MapPin size={14} className="text-emerald-400" />
                                {t('Delivery Location', 'Lieferstandort')} <span className="text-rose-400">*</span>
                            </label>

                            {addrList.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                    {addrList.map((addr: any) => (
                                        <button key={addr.id}
                                            onClick={() => { setSelectedAddrId(addr.id); setManualAddress(''); setManualPhone(''); }}
                                            className={`w-full text-left px-4 py-3 rounded-2xl border transition-all text-sm ${selectedAddrId === addr.id ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/5'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{addr.label}</span>
                                                {addr.isDefault && <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">Default</span>}
                                            </div>
                                            <p className="text-white/50 text-xs mt-0.5">{addr.address}</p>
                                            <p className="text-white/40 text-[10px]">📞 {addr.phone}</p>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setSelectedAddrId(null); setManualAddress(user?.address || ''); setManualPhone(user?.phone || ''); }}
                                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all text-sm ${!selectedAddrId ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/5'}`}>
                                        <span className="font-bold text-cyan-400">+ {t('Use another address', 'Andere Adresse verwenden')}</span>
                                    </button>
                                </div>
                            ) : null}

                            {/* Manual input: show when no saved addresses OR "use another" selected */}
                            {(addrList.length === 0 || !selectedAddrId) && (
                                <div className="space-y-2 mt-3">
                                    <input
                                        type="text" value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                                        placeholder={t('Full delivery address', 'Vollständige Lieferadresse')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                                    <input
                                        type="tel" value={manualPhone} onChange={e => setManualPhone(e.target.value)}
                                        placeholder={t('Phone number', 'Telefonnummer')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                                </div>
                            )}
                        </div>

                        {/* Order summary mini */}
                        <div className="bg-white/5 rounded-2xl p-4 space-y-1.5">
                            <div className="flex justify-between text-sm text-white/60">
                                <span>{items.length} {t('items', 'Artikel')}</span>
                                <span className="font-mono text-white">€{getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/60">
                                <span>{t('Delivery', 'Lieferung')}</span>
                                <span className="font-mono text-cyan-300">€2.50</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>{t('Total', 'Gesamt')}</span>
                                <span className="font-mono text-emerald-400">€{(getCartTotal() + 2.50).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={isProcessing || (!getFinalAddress() || !getFinalPhone())}
                            className="w-full h-14 rounded-2xl font-bold flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <Loader2 size={24} className="animate-spin text-black/60" />
                            ) : (
                                <span>✅ {t('Place Order', 'Bestellung aufgeben')}</span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div className="px-6 pt-16 pb-6 relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        <span className="text-emerald-400">{items.length} {t('items', 'Artikel')}</span>
                    </h1>
                    {items.length > 0 && (
                        <button onClick={clearCart} className="text-rose-400 font-bold text-sm">{t('Clear All', 'Alles löschen')}</button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="glass-dark rounded-3xl py-16 px-6 border border-white/10">
                            <div className="text-6xl mb-4">🛒</div>
                            <h2 className="text-xl font-bold mb-3">{t('Your cart is empty', 'Dein Warenkorb ist leer')}</h2>
                            <p className="text-white/50 text-sm mb-6">{t('Add some delicious items to get started!', 'Füge leckere Artikel hinzu!')}</p>
                            <Link href="/">
                                <button className="px-6 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95 transition-all">
                                    {t('Browse Menu', 'Menü durchsuchen')}
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.cartItemId} className="glass-dark rounded-3xl p-4 flex gap-4 items-center border border-white/5 shadow-xl relative overflow-hidden group">
                                <div className="absolute -top-6 -left-6 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors" />
                                {item.menuItem.imageUrl && (
                                    <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white/5">
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${item.menuItem.imageUrl}`} alt={item.menuItem.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 z-10">
                                    <h3 className="font-bold text-lg truncate">{item.menuItem.name}</h3>
                                    {item.selectedToppings.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.selectedToppings.map((t: any) => (
                                                <span key={t.id} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/60">{t.name}</span>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-emerald-400 font-mono font-bold mt-2 block">
                                        €{(item.menuItem.price * item.quantity + item.selectedToppings.reduce((s: number, t: any) => s + t.price, 0) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                                    <button onClick={() => item.quantity === 1 ? removeItem(item.cartItemId) : updateQuantity(item.cartItemId, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/20 text-rose-400">
                                        {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                                    </button>
                                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/20 text-emerald-400">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="glass-dark rounded-3xl p-6 border border-white/10 shadow-xl space-y-3">
                            <h2 className="text-xl font-bold">{t('Order Summary', 'Bestellübersicht')}</h2>
                            <div className="flex justify-between text-white/60 font-semibold">
                                <span>{t('Subtotal', 'Zwischensumme')}</span>
                                <span className="font-mono text-white">€{getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-white/60 font-semibold">
                                <span>{t('Delivery Fee', 'Liefergebühr')}</span>
                                <span className="font-mono text-cyan-300">€2.50</span>
                            </div>

                            <div className="flex gap-2">
                                <input className="flex-1 h-10 glass-dark rounded-xl px-4 text-sm border border-white/10 focus:ring-2 focus:ring-emerald-400 outline-none uppercase tracking-widest"
                                    placeholder={t('ENTER VOUCHER CODE', 'GUTSCHEINCODE EINGEBEN')} />
                                <button className="h-10 px-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors text-sm">
                                    {t('Apply', 'Einlösen')}
                                </button>
                            </div>

                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between font-bold text-xl">
                                <span>{t('Total', 'Gesamt')}</span>
                                <span className="font-mono text-emerald-400">€{(getCartTotal() + 2.50).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={openConfirmModal}
                            className="w-full mt-4 h-14 rounded-2xl font-bold flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95 transition-all"
                        >
                            <span>{t('Continue to Checkout', 'Weiter zur Kasse')}</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {toastMsg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-dark bg-black/80 w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        {toastMsg.type === 'success' ? (
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 font-bold text-2xl">
                                !
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-white mb-2">{toastMsg.title}</h3>
                        {toastMsg.desc && <p className="text-white/60 text-sm">{toastMsg.desc}</p>}
                    </div>
                </div>
            )}
        </main>
    );
}
