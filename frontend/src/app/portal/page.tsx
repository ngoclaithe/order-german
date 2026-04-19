'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { STATUS_CONFIG, STATUS_MESSAGES } from '@/lib/constants';
import { printInvoice } from '@/lib/print';
import { OrderTable } from './components/OrderTable';
import { OrderDetailModal } from './components/OrderDetailModal';
import { CancelModal } from './components/CancelModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ShippingModal } from './components/ShippingModal';

const PAGE_SIZE = 15;

export default function PortalOrders() {
    const { user, isAuthenticated } = useAuthStore();
    const qc = useQueryClient();
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(1);

    // Dialog states
    const [detailOrder, setDetailOrder] = useState<any>(null);
    const [cancelDialog, setCancelDialog] = useState<{ orderId: string } | null>(null);
    const [cancelNote, setCancelNote] = useState('');
    const [shippingDialog, setShippingDialog] = useState<{ orderId: string; current: number } | null>(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{ orderId: string } | null>(null);
    const [confirmShipFee, setConfirmShipFee] = useState('');

    useEffect(() => { setMounted(true); }, []);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: OrderService.getAllOrders,
        enabled: isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'CASHIER') && mounted,
        refetchInterval: 5000
    });

    const updateStatus = useMutation({
        mutationFn: (d: { id: string; status: string; cancelNote?: string }) => OrderService.updateOrderStatus(d.id, d.status, d.cancelNote),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); qc.invalidateQueries({ queryKey: ['admin-global-orders'] }); }
    });

    const updateShipping = useMutation({
        mutationFn: (d: { id: string; fee: number }) => OrderService.updateShippingFee(d.id, d.fee),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); }
    });

    const sendWhatsApp = (order: any) => {
        const phone = order.user?.whatsapp || order.user?.phone || order.guestPhone;
        if (!phone) return alert('No phone/WhatsApp for this customer.');
        const clean = phone.replace(/[^0-9]/g, '');
        const msg = STATUS_MESSAGES[order.status] || `Order status: ${order.status}`;
        const autoNote = "\n\n(This is an automated message from Order German, please do not reply.)";
        const text = encodeURIComponent(`[Order German] ${msg}\nOrder: #${order.id.slice(-6).toUpperCase()}\nTotal: €${order.totalAmount.toFixed(2)}${autoNote}`);
        window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
    };

    const handleStatusClick = (orderId: string, newStatus: string) => {
        if (newStatus === 'CANCELLED') { setCancelDialog({ orderId }); setCancelNote(''); }
        else if (newStatus === 'CONFIRMED') { setConfirmDialog({ orderId }); setConfirmShipFee(''); }
        else updateStatus.mutate({ id: orderId, status: newStatus });
    };

    if (!mounted) return <div className="min-h-screen bg-gray-50" />;

    const allOrders = Array.isArray(orders) ? orders : [];
    const filtered = filter === 'ALL' ? allOrders : allOrders.filter((o: any) => o.status === filter);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const counts: Record<string, number> = { ALL: allOrders.length };
    allOrders.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });

    return (
        <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', ...Object.keys(STATUS_CONFIG)].map(s => (
                    <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter === s ? (s === 'ALL' ? 'bg-gray-900 border-gray-900 text-white' : STATUS_CONFIG[s]?.bg + ' ' + STATUS_CONFIG[s]?.color) : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
                        {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label} <span className="ml-1 opacity-60">{counts[s] || 0}</span>
                    </button>
                ))}
            </div>

            <OrderTable
                isLoading={isLoading}
                paginated={paginated}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                filteredLength={filtered.length}
                handleStatusClick={handleStatusClick}
                setDetailOrder={setDetailOrder}
                openShippingDialog={(id, fee) => { setShippingDialog({ orderId: id, current: fee }); setShippingFee(fee); }}
                sendWhatsApp={sendWhatsApp}
                printInvoice={printInvoice}
            />

            <OrderDetailModal
                order={detailOrder}
                onClose={() => setDetailOrder(null)}
                onSendWhatsApp={sendWhatsApp}
                onSetShipping={(id, current) => { setDetailOrder(null); setShippingDialog({ orderId: id, current }); setShippingFee(current); }}
            />

            <ConfirmModal
                confirmDialog={confirmDialog}
                confirmShipFee={confirmShipFee}
                setConfirmShipFee={setConfirmShipFee}
                onClose={() => setConfirmDialog(null)}
                onConfirm={(fee) => {
                    if (confirmDialog) {
                        updateShipping.mutate({ id: confirmDialog.orderId, fee });
                        updateStatus.mutate({ id: confirmDialog.orderId, status: 'CONFIRMED' });
                        setConfirmDialog(null);
                    }
                }}
            />

            <CancelModal
                cancelDialog={cancelDialog}
                cancelNote={cancelNote}
                setCancelNote={setCancelNote}
                onClose={() => setCancelDialog(null)}
                onConfirm={() => {
                    if (cancelDialog) {
                        updateStatus.mutate({ id: cancelDialog.orderId, status: 'CANCELLED', cancelNote });
                        setCancelDialog(null);
                    }
                }}
            />

            <ShippingModal
                shippingDialog={shippingDialog}
                shippingFee={shippingFee}
                setShippingFee={setShippingFee}
                onClose={() => setShippingDialog(null)}
                onSave={(fee) => {
                    if (shippingDialog) {
                        updateShipping.mutate({ id: shippingDialog.orderId, fee });
                        setShippingDialog(null);
                    }
                }}
            />
        </div>
    );
}
