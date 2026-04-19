
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useLangStore } from '@/store/lang.store';
import { useState, useEffect, useRef } from 'react';
import { OrderService } from '@/services/order.service';
import Link from 'next/link';
import { Bell } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: 'Pending', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '⏳' },
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '✅' },
    PREPARING: { label: 'Preparing', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: '🍳' },
    DELIVERING: { label: 'Delivering', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: '🚗' },
    COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🎉' },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: '❌' },
};

export default function OrdersPage() {
    const { isAuthenticated } = useAuthStore();
    const { t } = useLangStore();
    const [mounted, setMounted] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const prevStatuses = useRef<Record<string, string>>({});

    useEffect(() => { setMounted(true); }, []);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: OrderService.getMyOrders,
        enabled: isAuthenticated && mounted,
        refetchInterval: 5000, // Poll every 5s for status updates
    });

    const orderList = Array.isArray(orders) ? orders : [];

    // Detect status changes and show notification
    useEffect(() => {
        if (orderList.length === 0) return;
        const currentMap: Record<string, string> = {};
        orderList.forEach((o: any) => { currentMap[o.id] = o.status; });

        if (Object.keys(prevStatuses.current).length > 0) {
            for (const [id, status] of Object.entries(currentMap)) {
                const prev = prevStatuses.current[id];
                if (prev && prev !== status) {
                    const info = STATUS_LABELS[status] || { label: status, icon: '📦' };
                    setToast(`${info.icon} Order #${id.slice(-6).toUpperCase()} → ${info.label}`);
                    setTimeout(() => setToast(null), 5000);
                    break;
                }
            }
        }
        prevStatuses.current = currentMap;
    }, [orderList]);

    if (!mounted) return <main className="min-h-screen bg-[#0f0f0f]" />;

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen pb-32 text-white relative flex flex-col items-center justify-center px-6">
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
                <h1 className="text-3xl font-extrabold mb-4">{t('Your Orders', 'Deine Bestellungen')}</h1>
                <p className="text-white/60 text-center mb-8">{t('Please log in to view your ongoing and past orders.', 'Bitte melde dich an.')}</p>
                <Link href="/profile">
                    <button className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold active:scale-95 transition-transform">
                        {t('Sign In', 'Anmelden')}
                    </button>
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-32 text-white relative overflow-y-auto no-scrollbar">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

            {/* Toast notification for status changes */}
            {toast && (
                <div className="fixed top-6 left-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-emerald-900/90 border border-emerald-500/40 backdrop-blur-xl p-4 rounded-2xl shadow-lg flex items-center gap-3">
                        <Bell className="text-emerald-400 shrink-0" size={20} />
                        <p className="text-emerald-200 font-bold text-sm">{toast}</p>
                    </div>
                </div>
            )}

            <div className="sticky top-0 z-40 px-6 pt-12 pb-4 glass-dark border-b border-white/5 backdrop-blur-3xl">
                <h1 className="text-3xl font-extrabold tracking-tight">{t('Active Orders', 'Aktive Bestellungen')}</h1>
            </div>

            <div className="px-6 py-6 pb-20 relative z-10">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="glass h-32 rounded-3xl animate-pulse bg-white/5 border border-white/5" />
                        ))}
                    </div>
                ) : orderList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                        <div className="text-6xl mb-4">🧾</div>
                        <h2 className="text-2xl font-bold">{t('No orders yet', 'Noch keine Bestellungen')}</h2>
                        <p className="text-white/50">{t('Your order history will appear here.', 'Dein Bestellverlauf wird hier angezeigt.')}</p>
                        <Link href="/">
                            <button className="mt-4 px-8 py-3 rounded-2xl bg-white/10 text-white font-bold border border-white/20 active:scale-95 transition-transform">
                                {t('Browse Menu', 'Speisekarte ansehen')}
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orderList.map((order: any) => {
                            const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
                            return (
                                <div key={order.id} className="glass rounded-3xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'PENDING' ? 'bg-amber-400' : order.status === 'CONFIRMED' ? 'bg-blue-400' : order.status === 'PREPARING' ? 'bg-violet-400' : order.status === 'DELIVERING' ? 'bg-cyan-400' : order.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                    <div className="pl-3">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs text-white/50 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>

                                        {order.cancelNote && (
                                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 mb-3 text-xs text-rose-300">
                                                ❌ {order.cancelNote}
                                            </div>
                                        )}

                                        <div className="space-y-2 mb-4">
                                            {order.orderItems?.map((item: any) => (
                                                <div key={item.id} className="text-sm flex justify-between">
                                                    <div>
                                                        <span>{item.quantity}x {item.menuItem?.name}</span>
                                                        {item.toppings?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                                {item.toppings.map((t: any) => (
                                                                    <span key={t.id} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/40">
                                                                        {t.toppingOption?.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-white/50 font-mono">€{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-white/10 mb-3" />

                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-white/30">{new Date(order.createdAt).toLocaleString()}</div>
                                            <div className="text-right">
                                                {order.shippingFee > 0 && <div className="text-[10px] text-white/40">Ship: €{order.shippingFee.toFixed(2)}</div>}
                                                <span className="font-mono text-emerald-400 font-bold text-lg">€{order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
