import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
    id: string;
    email: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
    telegram?: string;
    role: 'USER' | 'ADMIN' | 'CASHIER';
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    login: (user: UserProfile) => void;
    logout: (redirectTo?: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: (redirectTo?: string) => {
                set({ user: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('order-german-cart');
                    localStorage.removeItem('order-german-auth');
                    window.location.href = redirectTo || '/';
                }
            },
        }),
        {
            name: 'order-german-auth',
        }
    )
);
