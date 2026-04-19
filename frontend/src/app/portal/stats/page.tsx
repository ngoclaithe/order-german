'use client';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PortalStats() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: OrderService.getStats,
        refetchInterval: 30000,
    });
    const stats = data as any;

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const chartData = stats?.dailyBreakdown?.map((d: any) => ({
        name: d.date.slice(5),
        Revenue: Math.round(d.revenue),
        Orders: d.count
    })) || [];

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <BarChart3 size={32} className="text-emerald-600" /> Statistics & Analytics
                </h1>
                <p className="text-gray-500 mt-1">Daily and weekly revenue breakdown.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><DollarSign size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Today Revenue</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">€{(stats?.today?.revenue || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{stats?.today?.count || 0} orders</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-sm">
                    <div className="flex items-center gap-3 text-cyan-600">
                        <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center"><TrendingUp size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">This Week</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">€{(stats?.week?.revenue || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{stats?.week?.count || 0} orders</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-sm">
                    <div className="flex items-center gap-3 text-violet-600">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center"><ShoppingBag size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Total Orders</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats?.total || 0}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-600">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><BarChart3 size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Status Breakdown</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {stats?.statusCounts?.map((s: any) => (
                            <span key={s.status} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{s.status}: {s.count}</span>
                        )) || <span className="text-xs text-gray-400">No data</span>}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Last 7 Days Revenue</h2>
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `€${value}`} />
                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="Revenue" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
