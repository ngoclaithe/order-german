import api from '@/lib/api';

export const UserService = {
    getAll: async () => {
        try {
            return await api.get('/users') || [];
        } catch (e) {
            return [];
        }
    },
    create: async (data: { email: string; password: string; phone?: string; address?: string; role?: string }) => {
        return api.post('/users', data);
    },
    update: async (id: string, data: any) => {
        return api.patch(`/users/${id}`, data);
    },
    delete: async (id: string) => {
        return api.delete(`/users/${id}`);
    },
};
