'use client';

import { Home, Compass, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import Link from 'next/link';
import { useLangStore } from '@/store/lang.store';
import { useState, useEffect } from 'react';

export function BottomNav() {
    const cartItemsCount = useCartStore((state) =>
        state.items.reduce((acc, item) => acc + item.quantity, 0)
    );
    const { t } = useLangStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a blank skeleton of the exact same size to avoid content layout shift
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
                <div className="max-w-md mx-auto relative">
                    <div className="glass-dark rounded-[2rem] p-2 flex justify-between items-center shadow-2xl border border-white/10" style={{ height: '84px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
            <div className="max-w-md mx-auto relative">
                <div className="glass-dark border border-white/10 rounded-3xl flex justify-around items-center p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] backdrop-blur-3xl">

                    <Link href="/" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-transform active:scale-95">
                        <div className="p-2 rounded-2xl">
                            <Home size={22} className="text-current" />
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{t('Home', 'Start')}</span>
                    </Link>

                    <Link href="/orders" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-all active:scale-95">
                        <div className="p-2 rounded-2xl">
                            <Compass size={22} />
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{t('Orders', 'Bestellungen')}</span>
                    </Link>

                    <Link href="/cart" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-all active:scale-95 relative">
                        <div className="p-2 rounded-2xl">
                            <ShoppingBag size={22} />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-1 right-2 w-5 h-5 bg-gradient-to-tr from-rose-500 to-orange-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg transform scale-110">
                                    {cartItemsCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{t('Cart', 'Warenkorb')}</span>
                    </Link>

                    <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white transition-all active:scale-95">
                        <div className="p-2 rounded-2xl">
                            <User size={22} />
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{t('Profile', 'Profil')}</span>
                    </Link>

                </div>
            </div>
        </div>
    );
}
