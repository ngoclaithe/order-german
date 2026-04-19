import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, ToppingOption } from '@/services/menu.service';

export interface CartItem {
    cartItemId: string; // Unique ID for the cart row
    menuItem: MenuItem;
    quantity: number;
    selectedToppings: ToppingOption[];
    totalItemPrice: number;
    note?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => ({ items: [...state.items, item] })),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.cartItemId !== id),
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.cartItemId === id ? { ...i, quantity } : i
                    ),
                })),
            clearCart: () => set({ items: [] }),
            getCartTotal: () => {
                const state = get();
                return state.items.reduce(
                    (total, item) => total + item.totalItemPrice * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'order-german-cart',
        }
    )
);
