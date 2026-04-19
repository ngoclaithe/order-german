import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
    constructor(private prisma: PrismaService) { }

    // ====== PUBLIC (only active items) ======
    async getMenuCategories() {
        return this.prisma.menuCategory.findMany({
            include: {
                items: {
                    where: { isActive: true },
                    include: {
                        toppingGroups: {
                            include: { options: true },
                        },
                    },
                },
            },
        });
    }

    async getMenuItem(id: string) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id },
            include: {
                toppingGroups: { include: { options: true } },
            },
        });
        if (!item) throw new NotFoundException(`Menu item with ID ${id} not found`);
        return item;
    }

    // ====== ADMIN: Categories ======
    async createCategory(data: { name: string }) {
        return this.prisma.menuCategory.create({ data });
    }
    async updateCategory(id: string, data: { name: string }) {
        return this.prisma.menuCategory.update({ where: { id }, data });
    }
    async deleteCategory(id: string) {
        return this.prisma.menuCategory.delete({ where: { id } });
    }

    // ====== ADMIN: Menu Items (includes inactive) ======
    async getAllMenuCategories() {
        return this.prisma.menuCategory.findMany({
            include: {
                items: {
                    include: {
                        toppingGroups: { include: { options: true } },
                    },
                },
            },
        });
    }

    async createMenuItem(data: { name: string; description?: string; price: number; imageUrl?: string; categoryId: string }) {
        return this.prisma.menuItem.create({ data });
    }
    async updateMenuItem(id: string, data: { name?: string; description?: string; price?: number; imageUrl?: string; isActive?: boolean; categoryId?: string }) {
        return this.prisma.menuItem.update({ where: { id }, data });
    }
    async deleteMenuItem(id: string) {
        return this.prisma.menuItem.delete({ where: { id } });
    }

    // ====== ADMIN: Topping Groups ======
    async createToppingGroup(data: { name: string; menuItemId: string; requiresSelection?: boolean; multipleSelection?: boolean }) {
        return this.prisma.toppingGroup.create({ data });
    }
    async updateToppingGroup(id: string, data: { name?: string; requiresSelection?: boolean; multipleSelection?: boolean }) {
        return this.prisma.toppingGroup.update({ where: { id }, data });
    }
    async deleteToppingGroup(id: string) {
        return this.prisma.toppingGroup.delete({ where: { id } });
    }

    // ====== ADMIN: Topping Options ======
    async createToppingOption(data: { name: string; price: number; toppingGroupId: string }) {
        return this.prisma.toppingOption.create({ data });
    }
    async updateToppingOption(id: string, data: { name?: string; price?: number }) {
        return this.prisma.toppingOption.update({ where: { id }, data });
    }
    async deleteToppingOption(id: string) {
        return this.prisma.toppingOption.delete({ where: { id } });
    }
}
