import api from '@/lib/api';
import { UserProfile } from '@/store/auth.store';

export const AuthService = {
    async login(data: any): Promise<UserProfile> {
        return api.post('/auth/login', data);
    },

    async register(data: any): Promise<UserProfile> {
        return api.post('/auth/register', data);
    },

    async logout(): Promise<void> {
        return api.post('/auth/logout');
    },

    async getProfile(): Promise<UserProfile> {
        return api.get('/auth/me');
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        return api.post('/auth/forgot-password', { email });
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
        return api.post('/auth/change-password', { oldPassword, newPassword });
    }
};
