import { X, MessageCircle, Truck } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/constants';

interface Props {
    order: any;
    onClose: () => void;
    onSendWhatsApp: (order: any) => void;
    onSetShipping: (orderId: string, currentFee: number) => void;
}

export function OrderDetailModal({ order, onClose, onSendWhatsApp, onSetShipping }: Props) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold border ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.color}`}>
                        {STATUS_CONFIG[order.status]?.label}
                    </span>
                    {order.shippingFee > 0 && <span className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">Ship: €{order.shippingFee.toFixed(2)}</span>}
                </div>
                {order.cancelNote && <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-700">❌ {order.cancelNote}</div>}
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                    {order.user?.email && <p>📧 {order.user.email}</p>}
                    {order.user?.phone && <p>📱 {order.user.phone}</p>}
                    {order.user?.whatsapp && <p>💬 WA: {order.user.whatsapp}</p>}
                    {order.guestName && <p>👤 {order.guestName}</p>}
                    {order.guestPhone && <p>📱 {order.guestPhone}</p>}
                    {order.guestAddress && <p>📍 {order.guestAddress}</p>}
                    <p>🕐 {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                    {order.orderItems?.map((oi: any) => (
                        <div key={oi.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {oi.menuItem?.imageUrl ? <img src={oi.menuItem.imageUrl.startsWith('http') ? oi.menuItem.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${oi.menuItem.imageUrl}`} alt="" className="w-full h-full object-cover" /> : <span>🍔</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <span className="font-bold text-sm text-gray-900">{oi.menuItem?.name}</span>
                                    <span className="text-emerald-600 font-mono text-xs">€{(oi.price * oi.quantity).toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-gray-400">Qty: {oi.quantity} × €{oi.price.toFixed(2)}</p>
                                {oi.toppings?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {oi.toppings.map((t: any) => (
                                            <span key={t.id} className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded">
                                                {t.toppingOption?.name} {t.price > 0 ? `+€${t.price.toFixed(2)}` : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="text-emerald-600 font-mono font-bold text-xl">€{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { onClose(); onSendWhatsApp(order); }} className="flex-1 h-9 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><MessageCircle size={13} /> WhatsApp</button>
                    <button onClick={() => { onClose(); onSetShipping(order.id, order.shippingFee || 0); }} className="flex-1 h-9 bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><Truck size={13} /> Ship Fee</button>
                </div>
            </div>
        </div>
    );
}
