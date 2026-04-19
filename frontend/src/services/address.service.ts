import api from '@/lib/api';

export const AddressService = {
    getAddresses: async () => {
        try { return await api.get('/addresses') || []; }
        catch { return []; }
    },
    createAddress: async (data: { label: string; address: string; phone: string; isDefault?: boolean }) => {
        return api.post('/addresses', data);
    },
    updateAddress: async (id: string, data: any) => {
        return api.patch(`/addresses/${id}`, data);
    },
    deleteAddress: async (id: string) => {
        return api.delete(`/addresses/${id}`);
    },
    setDefault: async (id: string) => {
        return api.patch(`/addresses/${id}/default`);
    },
};
