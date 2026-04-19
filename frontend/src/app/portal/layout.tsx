'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Users as UsersIcon, LogOut, PackageOpen, Menu, X, Bell, BarChart3, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import api from '@/lib/api';

// ====== INLINE LOGIN FORM ======
function PortalLogin() {
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user: any = await api.post('/auth/login', { email, password });
            if (user.role !== 'ADMIN' && user.role !== 'CASHIER') {
                setError('Access denied. Only ADMIN or CASHIER accounts can access the portal.');
                return;
            }
            login(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/20">P</div>
                    <h1 className="text-2xl font-black text-gray-900">Staff Portal</h1>
                    <p className="text-gray-500 mt-1 text-sm">Sign in with your admin or cashier account</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-5">
                    {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@order-german.com" required
                            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
                        <div className="relative">
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 pr-10 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                        {loading ? <span className="animate-pulse">Signing in...</span> : <><Lock size={16} /> Sign In to Portal</>}
                    </button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-6">Order German © 2026 · Staff Portal</p>
            </div>
        </div>
    );
}

// ====== MAIN LAYOUT ======
export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const prevPendingCount = useRef(0);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const { data: orders } = useQuery({
        queryKey: ['admin-global-orders'],
        queryFn: OrderService.getAllOrders,
        enabled: mounted && isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'CASHIER'),
        refetchInterval: 5000
    });

    const orderList = Array.isArray(orders) ? orders : [];
    const pendingOrders = orderList.filter((o: any) => o.status === 'PENDING');
    const pendingCount = pendingOrders.length;

    useEffect(() => {
        if (pendingCount > prevPendingCount.current && prevPendingCount.current > 0) {
            const diff = pendingCount - prevPendingCount.current;
            setToast(`🔔 ${diff} new order(s) just arrived!`);
            setTimeout(() => setToast(null), 6000);
        }
        prevPendingCount.current = pendingCount;
    }, [pendingCount]);

    if (!mounted) return <div className="min-h-screen bg-gray-50" />;

    // Not authenticated or wrong role → show login
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'CASHIER')) {
        return <PortalLogin />;
    }

    const isAdmin = user?.role === 'ADMIN';

    const navigation = [
        { name: 'Orders', href: '/portal?tab=orders', icon: ShoppingBag, badge: pendingCount > 0 ? pendingCount : null, allowed: true },
        { name: 'Products', href: '/portal/products?tab=products', icon: PackageOpen, badge: null, allowed: isAdmin },
        { name: 'Users', href: '/portal/users?tab=users', icon: UsersIcon, badge: null, allowed: isAdmin },
        { name: 'Statistics', href: '/portal/stats?tab=stats', icon: BarChart3, badge: null, allowed: isAdmin },
    ].filter(n => n.allowed);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex overflow-hidden">
            {/* Mobile toggle */}
            {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-xl shadow-sm lg:hidden">
                    <Menu size={24} className="text-gray-600" />
                </button>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative top-0 left-0 h-screen bg-white border-r border-gray-200 shrink-0 flex flex-col z-30 transition-all duration-300 shadow-sm
                ${isSidebarOpen ? 'w-60 translate-x-0' : 'w-0 -translate-x-full lg:w-[68px] lg:translate-x-0'}`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0 overflow-hidden">
                    <h1 className={`text-lg font-black tracking-tight flex items-center gap-2.5 ${!isSidebarOpen && 'lg:hidden'}`}>
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shrink-0 text-sm font-black">P</span>
                        {isSidebarOpen && <span className="whitespace-nowrap text-gray-900">Portal</span>}
                    </h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 shrink-0"><X size={20} /></button>
                </div>

                <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden px-2.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href.split('?')[0];
                        return (
                            <Link key={item.name} href={item.href} title={item.name}
                                className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 font-medium relative
                                    ${isSidebarOpen ? 'px-3.5' : 'px-0 justify-center'}
                                    ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'}`}>
                                <div className="relative shrink-0">
                                    <item.icon size={19} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                                    {item.badge && !isSidebarOpen && (
                                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">{item.badge}</span>
                                    )}
                                </div>
                                {isSidebarOpen && <span className="whitespace-nowrap text-sm">{item.name}</span>}
                                {item.badge && isSidebarOpen && (
                                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{item.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2.5 border-t border-gray-100 space-y-0.5 shrink-0">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`hidden lg:flex items-center gap-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 w-full rounded-xl transition-colors text-sm ${isSidebarOpen ? 'px-3.5' : 'px-0 justify-center'}`}>
                        <Menu size={17} className="shrink-0" />
                        {isSidebarOpen && <span>Collapse</span>}
                    </button>
                    <button onClick={() => logout('/portal')}
                        className={`flex items-center gap-3 py-2 text-rose-500 hover:bg-rose-50 w-full rounded-xl transition-colors text-sm group ${isSidebarOpen ? 'px-3.5' : 'px-0 justify-center'}`}>
                        <LogOut size={17} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 h-screen overflow-x-hidden overflow-y-auto relative bg-gray-50">
                {/* Top Bar */}
                <header className="sticky top-0 z-20 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="hidden lg:block p-1.5 text-gray-400 hover:text-gray-600"><Menu size={20} /></button>
                        )}
                        <span className="text-sm text-gray-400 font-medium capitalize">{pathname === '/portal' ? 'Orders' : pathname.split('/').pop()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative overflow-visible">
                            <Link href="/portal" className="block p-2 text-gray-400 hover:text-gray-700 transition-colors">
                                <Bell size={20} />
                            </Link>
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse px-1">{pendingCount}</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            {user?.email} <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{user?.role}</span>
                        </div>
                    </div>
                </header>

                {/* Toast */}
                {toast && (
                    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-lg flex items-center gap-3">
                            <Bell className="text-emerald-600" size={20} />
                            <p className="text-emerald-800 font-bold text-sm">{toast}</p>
                        </div>
                    </div>
                )}

                {!isSidebarOpen && <div className="lg:hidden h-14" />}
                {children}
            </main>
        </div>
    );
}
