import api from '@/lib/api';

export interface ToppingOption {
    id: string;
    name: string;
    price: number;
}

export interface ToppingGroup {
    id: string;
    name: string;
    requiresSelection: boolean;
    multipleSelection: boolean;
    options: ToppingOption[];
}

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    image?: string;
    imageUrl?: string;
    price: number;
    originalPrice?: number;
    isActive?: boolean;
    toppingGroups: ToppingGroup[];
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}

export const MenuService = {
    // Public (active items only)
    async getCategories(): Promise<MenuCategory[]> {
        return api.get('/menu');
    },
    async getMenuItem(id: string): Promise<MenuItem> {
        return api.get(`/menu/item/${id}`);
    },

    // Admin (all items including inactive)
    async getAdminCategories(): Promise<MenuCategory[]> {
        return api.get('/menu/admin/all');
    },

    // Categories CRUD
    async createCategory(data: { name: string }) {
        return api.post('/menu/categories', data);
    },
    async updateCategory(id: string, data: { name: string }) {
        return api.patch(`/menu/categories/${id}`, data);
    },
    async deleteCategory(id: string) {
        return api.delete(`/menu/categories/${id}`);
    },

    // Items CRUD
    async createItem(data: any) {
        return api.post('/menu/items', data);
    },
    async updateItem(id: string, data: any) {
        return api.patch(`/menu/items/${id}`, data);
    },
    async deleteItem(id: string) {
        return api.delete(`/menu/items/${id}`);
    },

    // Topping Groups CRUD
    async createToppingGroup(data: any) {
        return api.post('/menu/topping-groups', data);
    },
    async updateToppingGroup(id: string, data: any) {
        return api.patch(`/menu/topping-groups/${id}`, data);
    },
    async deleteToppingGroup(id: string) {
        return api.delete(`/menu/topping-groups/${id}`);
    },

    // Topping Options CRUD
    async createToppingOption(data: any) {
        return api.post('/menu/topping-options', data);
    },
    async updateToppingOption(id: string, data: any) {
        return api.patch(`/menu/topping-options/${id}`, data);
    },
    async deleteToppingOption(id: string) {
        return api.delete(`/menu/topping-options/${id}`);
    },
};
