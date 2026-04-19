'use client';

import { useQuery } from '@tanstack/react-query';
import { MenuService, MenuItem } from '@/services/menu.service';
import { Search, MapPin, ChevronRight, Globe2, Bell, Plus, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToppingModal } from '@/components/ToppingModal';
import { useAuthStore } from '@/store/auth.store';
import { useLangStore } from '@/store/lang.store';
import { OrderService } from '@/services/order.service';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { lang, toggleLang, t } = useLangStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: MenuService.getCategories,
  });

  const { data: activeOrders } = useQuery({
    queryKey: ['my-active-orders'],
    queryFn: async () => {
      const orders: any[] = await OrderService.getMyOrders() as any;
      return Array.isArray(orders) ? orders.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status)) : [];
    },
    enabled: isAuthenticated && mounted,
    refetchInterval: 10000 // Poll every 10s per spec
  });

  const filteredCategories = categories?.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(cat => cat.items.length > 0) || [];

  if (!mounted) {
    return <main className="min-h-screen bg-[#0f0f0f]" />;
  }

  return (
    <main className="min-h-screen pb-32 text-white relative overflow-y-auto no-scrollbar">
      {/* Mesh gradients for depth */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-32 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 px-6 pt-12 pb-4 glass-dark border-b border-white/5 backdrop-blur-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6 relative">
          {isAuthenticated ? (
            <div className="flex flex-col">
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-1">{t('Delivering to', 'Lieferung an')}</span>
              <div className="flex items-center gap-1 cursor-pointer">
                <MapPin size={16} className="text-emerald-400" />
                <span className="font-bold tracking-wide">{user?.address || 'Berlin, Germany'}</span>
                <ChevronRight size={16} className="text-white/40" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase mb-1">{t('Welcome Guest', 'Willkommen Gast')}</span>
              <span className="font-bold tracking-wide text-emerald-400">{t('Order Authentic German Food', 'Authentisches deutsches Essen bestellen')}</span>
            </div>
          )}

          <div className="flex items-center gap-3 relative">
            {/* Notification Bell */}
            {isAuthenticated && (
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="h-10 w-10 glass rounded-full flex items-center justify-center border-white/10 active:scale-95 transition-transform relative"
              >
                <Bell size={18} className="text-white/80" />
                {activeOrders && activeOrders.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                )}
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="h-10 px-3 glass rounded-full flex items-center justify-center gap-2 border-white/10 active:scale-95 transition-transform"
            >
              <Globe2 size={16} className="text-white/80" />
              <span className="font-bold text-xs">{lang}</span>
            </button>

            {/* Auth Icon */}
            {isAuthenticated ? (
              <button
                onClick={() => { AuthService.logout().catch(() => { }); logout(); }}
                className="h-10 w-10 glass rounded-full flex items-center justify-center border-white/10 active:scale-95 transition-transform hover:bg-rose-500/20"
                title="Logout"
              >
                <LogOut size={18} className="text-rose-400" />
              </button>
            ) : (
              <Link href="/profile">
                <div className="h-10 w-10 glass rounded-full flex items-center justify-center border-white/10 active:scale-95 transition-transform hover:bg-emerald-500/20">
                  <LogIn size={18} className="text-emerald-400" />
                </div>
              </Link>
            )}

            {/* Notification Dropdown Overlay */}
            {isNotifOpen && (
              <div className="absolute top-14 right-0 w-80 bg-[#0d0d0d]/95 backdrop-blur-2xl p-5 rounded-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-3 fade-in z-[100]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base">{t('Notifications', 'Benachrichtigungen')}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">{activeOrders?.length || 0}</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {(!activeOrders || activeOrders.length === 0) ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">🔔</div>
                      <p className="text-white/40 text-sm">{t('No active orders', 'Keine aktiven Bestellungen')}</p>
                    </div>
                  ) : (
                    activeOrders.map((o: any) => {
                      const statusMap: Record<string, { icon: string; color: string; label: string }> = {
                        PENDING: { icon: '⏳', color: 'text-amber-300', label: t('Pending', 'Ausstehend') },
                        CONFIRMED: { icon: '✅', color: 'text-blue-300', label: t('Confirmed', 'Bestätigt') },
                        PREPARING: { icon: '🍳', color: 'text-violet-300', label: t('Preparing', 'Wird zubereitet') },
                        DELIVERING: { icon: '🚗', color: 'text-cyan-300', label: t('Delivering', 'Wird geliefert') },
                      };
                      const s = statusMap[o.status] || { icon: '📦', color: 'text-white/60', label: o.status };
                      return (
                        <div key={o.id} className="bg-white/[0.04] rounded-2xl p-3.5 border border-white/[0.06] flex items-start gap-3 hover:bg-white/[0.07] transition-colors">
                          <div className="text-xl mt-0.5">{s.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono text-white/50">#{o.id.slice(-6).toUpperCase()}</span>
                              <span className={`text-[10px] font-bold ${s.color}`}>{s.label}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="font-mono text-emerald-300 font-bold text-sm">€{o.totalAmount.toFixed(2)}</span>
                              {o.shippingFee > 0 && <span className="text-[9px] text-white/30">+€{o.shippingFee.toFixed(2)} ship</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-4">
          {t('What are you', 'Worauf hast du')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
            {t('craving today?', 'heute Lust?')}
          </span>
        </h1>

        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Search burgers, drinks...', 'Suche Burger, Getränke...')}
            className="w-full h-14 pl-12 pr-4 rounded-2xl glass bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner translate-z-0"
          />
        </div>
      </div>

      <div className="px-6 py-6 pb-20 relative z-10 space-y-12">
        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass h-32 rounded-3xl animate-pulse bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            {t('No results found.', 'Keine Ergebnisse gefunden.')}
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id} className="animate-fade-in-up">
              <h2 className="text-2xl font-bold tracking-tight mb-5 flex items-center gap-2">
                {category.name}
                <div className="h-px bg-white/10 flex-1 ml-2" />
              </h2>

              <div className="flex flex-col gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item as MenuItem)}
                    className="glass rounded-[2rem] p-4 flex gap-4 cursor-pointer active:scale-95 transition-transform border border-white/10 shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-28 h-28 shrink-0 rounded-2xl relative overflow-hidden z-10">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-black/50 rounded-2xl flex items-center justify-center text-5xl">
                          {category.name.toLowerCase().includes('drink') ? '🥤' : '🍔'}
                        </div>
                      )}

                      {(item as any).isCombo && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                          COMBO
                        </span>
                      )}
                    </div>

                    <div className="flex-1 py-2 z-10">
                      <h3 className="text-lg font-bold tracking-wide">{item.name}</h3>
                      {item.description && (
                        <p className="text-white/50 text-xs mt-1 leading-snug line-clamp-2 pr-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="font-mono font-bold text-emerald-300 text-sm">
                          €{item.price.toFixed(2)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <>
                            <span className="font-mono text-white/30 text-xs line-through">€{item.originalPrice.toFixed(2)}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded-full">
                              -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        {/* Error State */}
        {error && (
          <div className="glass-dark p-6 rounded-2xl text-center text-rose-300 border border-rose-500/30 mt-4 flex flex-col gap-2 shadow-lg">
            <span className="font-bold text-lg">Failed to connect to the server.</span>
            <span className="text-sm">Please check your internet connection or ensure the backend is running properly.</span>
          </div>
        )}
      </div>

      <ToppingModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}
