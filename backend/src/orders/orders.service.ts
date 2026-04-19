import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async createOrder(userId: string | null, dto: any) {
        // Validate userId exists in DB (might be stale from old JWT after re-seed)
        if (userId) {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
            if (!userExists) userId = null;
        }

        // Validate all items are active
        for (const item of dto.items) {
            const menuItem = await this.prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (!menuItem || !menuItem.isActive) {
                throw new BadRequestException(`Item "${menuItem?.name || item.menuItemId}" is currently unavailable.`);
            }
        }

        let totalAmount = 0;
        for (const item of dto.items) {
            let itemTotal = item.price;
            if (item.toppings) {
                for (const t of item.toppings) itemTotal += t.price;
            }
            totalAmount += itemTotal * item.quantity;
        }

        return this.prisma.order.create({
            data: {
                totalAmount,
                userId: userId || null,
                guestName: dto.guestName,
                guestPhone: dto.guestPhone,
                guestAddress: dto.guestAddress,
                status: 'PENDING',
                orderItems: {
                    create: dto.items.map((item: any) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        price: item.price,
                        toppings: {
                            create: item.toppings?.map((t: any) => ({
                                toppingOptionId: t.toppingOptionId,
                                price: t.price,
                            })) || [],
                        }
                    })),
                }
            },
            include: { orderItems: { include: { toppings: true } } }
        });
    }

    async getMyOrders(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                orderItems: { include: { menuItem: true, toppings: { include: { toppingOption: true } } } }
            }
        });
    }

    async getAllOrders() {
        return this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, email: true, phone: true, whatsapp: true } },
                orderItems: { include: { menuItem: true, toppings: { include: { toppingOption: true } } } }
            }
        });
    }

    async updateOrderStatus(orderId: string, status: string, cancelNote?: string, shippingFee?: number) {
        const data: any = { status };
        if (cancelNote) data.cancelNote = cancelNote;
        if (shippingFee !== undefined && shippingFee !== null) data.shippingFee = shippingFee;

        return this.prisma.order.update({
            where: { id: orderId },
            data,
            include: { user: { select: { whatsapp: true, phone: true, email: true } } }
        });
    }

    async updateShippingFee(orderId: string, shippingFee: number) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { shippingFee },
        });
    }

    // ====== STATISTICS ======
    async getStats() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);

        const [todayOrders, weekOrders, allOrders, statusCounts] = await Promise.all([
            this.prisma.order.findMany({ where: { createdAt: { gte: todayStart } } }),
            this.prisma.order.findMany({ where: { createdAt: { gte: weekStart } } }),
            this.prisma.order.count(),
            this.prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
        ]);

        const todayRevenue = todayOrders.reduce((s, o) => s + o.totalAmount, 0);
        const weekRevenue = weekOrders.reduce((s, o) => s + o.totalAmount, 0);

        const dailyBreakdown: { date: string; count: number; revenue: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - i);
            const nextD = new Date(d);
            nextD.setDate(nextD.getDate() + 1);
            const dayOrders = weekOrders.filter(o => o.createdAt >= d && o.createdAt < nextD);
            dailyBreakdown.push({
                date: d.toISOString().split('T')[0],
                count: dayOrders.length,
                revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
            });
        }

        return {
            today: { count: todayOrders.length, revenue: todayRevenue },
            week: { count: weekOrders.length, revenue: weekRevenue },
            total: allOrders,
            statusCounts: statusCounts.map(s => ({ status: s.status, count: s._count.id })),
            dailyBreakdown,
        };
    }
}
