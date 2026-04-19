import { Eye, Truck, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/constants';

interface Props {
    isLoading: boolean;
    paginated: any[];
    totalPages: number;
    page: number;
    setPage: (p: number | ((p: number) => number)) => void;
    filteredLength: number;
    handleStatusClick: (orderId: string, newStatus: string) => void;
    setDetailOrder: (order: any) => void;
    openShippingDialog: (orderId: string, currentFee: number) => void;
    sendWhatsApp: (order: any) => void;
    printInvoice: (order: any) => void;
}

export function OrderTable({
    isLoading,
    paginated,
    totalPages,
    page,
    setPage,
    filteredLength,
    handleStatusClick,
    setDetailOrder,
    openShippingDialog,
    sendWhatsApp,
    printInvoice
}: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Time</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map(i => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td></tr>)
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No orders found.</td></tr>
                        ) : paginated.map((order: any) => {
                            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            return (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-gray-900 text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs text-gray-600 truncate max-w-[140px]">{order.user?.email || order.guestName || 'Guest'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {order.orderItems?.slice(0, 3).map((oi: any) => (
                                                <span key={oi.id} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{oi.quantity}x {oi.menuItem?.name?.slice(0, 12)}</span>
                                            ))}
                                            {order.orderItems?.length > 3 && <span className="text-[10px] text-gray-300">+{order.orderItems.length - 3}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-emerald-600 font-mono font-bold text-xs">€{order.totalAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <select value={order.status} onChange={e => handleStatusClick(order.id, e.target.value)}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${sc.bg} ${sc.color}`}>
                                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-[10px] text-gray-400 whitespace-nowrap">{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => setDetailOrder(order)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-500 hover:text-gray-800" title="View Detail"><Eye size={13} /></button>
                                            <button onClick={() => openShippingDialog(order.id, order.shippingFee || 0)} className="p-1.5 bg-cyan-50 hover:bg-cyan-100 rounded-md text-cyan-600" title="Shipping"><Truck size={13} /></button>
                                            <button onClick={() => sendWhatsApp(order)} className="p-1.5 bg-green-50 hover:bg-green-100 rounded-md text-green-600" title="WhatsApp"><MessageCircle size={13} /></button>
                                            {(order.status === 'DELIVERING' || order.status === 'COMPLETED') && (
                                                <button onClick={() => printInvoice(order)} className="p-1.5 bg-gray-900 text-white hover:bg-gray-800 rounded-md" title="Print Invoice">🖨️</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{filteredLength} orders · Page {page}/{totalPages}</span>
                    <div className="flex gap-1">
                        <button onClick={() => setPage(p => Math.max(1, typeof p === 'number' ? p - 1 : p))} disabled={page === 1} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-500 disabled:opacity-20"><ChevronLeft size={14} /></button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                            const p = start + i;
                            if (p > totalPages) return null;
                            return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-md text-xs font-bold ${p === page ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{p}</button>;
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages, typeof p === 'number' ? p + 1 : p))} disabled={page === totalPages} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-500 disabled:opacity-20"><ChevronRight size={14} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
