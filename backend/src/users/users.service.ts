import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async createUser(data: any) {
        return this.prisma.user.create({ data });
    }

    async update(id: string, data: any) {
        return this.prisma.user.update({ where: { id }, data });
    }

    async createDefaultAddress(userId: string, data: { label: string; address: string; phone: string }) {
        return this.prisma.userAddress.create({
            data: { ...data, isDefault: true, userId },
        });
    }

    // ====== ADMIN ======
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                phone: true,
                address: true,
                whatsapp: true,
                telegram: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async adminCreateUser(data: { email: string; password: string; phone?: string; address?: string; role?: string }) {
        const hash = await argon2.hash(data.password);
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: hash,
                phone: data.phone,
                address: data.address,
                role: (data.role as any) || 'USER',
            }
        });
    }

    async adminUpdateUser(id: string, data: { email?: string; phone?: string; address?: string; role?: string; whatsapp?: string; telegram?: string }) {
        const updateData: any = { ...data };
        if (data.role) updateData.role = data.role;
        return this.prisma.user.update({
            where: { id },
            data: updateData
        });
    }

    async adminDeleteUser(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}
