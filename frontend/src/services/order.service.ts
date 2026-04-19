import api from '@/lib/api';

export const OrderService = {
    getMyOrders: async () => {
        try {
            return await api.get('/orders/my-orders') || [];
        } catch (e: any) {
            console.error('[getMyOrders] ERROR:', e?.response?.status, e?.response?.data || e?.message);
            return [];
        }
    },
    getAllOrders: async () => {
        try {
            return await api.get('/orders') || [];
        } catch (e) {
            return [];
        }
    },
    updateOrderStatus: async (id: string, status: string, cancelNote?: string, shippingFee?: number) => {
        return api.patch(`/orders/${id}/status`, { status, cancelNote, shippingFee });
    },
    updateShippingFee: async (id: string, shippingFee: number) => {
        return api.patch(`/orders/${id}/shipping`, { shippingFee });
    },
    getStats: async (): Promise<any> => {
        return await api.get('/orders/stats') || {};
    }
};
