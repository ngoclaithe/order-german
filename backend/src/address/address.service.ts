import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
    constructor(private prisma: PrismaService) { }

    async getAddresses(userId: string) {
        return this.prisma.userAddress.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async createAddress(userId: string, data: { label: string; address: string; phone: string; isDefault?: boolean }) {
        // If setting as default, unset all others first
        if (data.isDefault) {
            await this.prisma.userAddress.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        // If first address, make it default
        const count = await this.prisma.userAddress.count({ where: { userId } });
        const isDefault = count === 0 ? true : (data.isDefault || false);

        return this.prisma.userAddress.create({
            data: { ...data, isDefault, userId },
        });
    }

    async updateAddress(userId: string, id: string, data: { label?: string; address?: string; phone?: string; isDefault?: boolean }) {
        if (data.isDefault) {
            await this.prisma.userAddress.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return this.prisma.userAddress.update({
            where: { id },
            data,
        });
    }

    async deleteAddress(userId: string, id: string) {
        const addr = await this.prisma.userAddress.delete({ where: { id } });
        // If deleted the default, set next one as default
        if (addr.isDefault) {
            const next = await this.prisma.userAddress.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
            if (next) {
                await this.prisma.userAddress.update({ where: { id: next.id }, data: { isDefault: true } });
            }
        }
        return addr;
    }

    async setDefault(userId: string, id: string) {
        await this.prisma.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
        return this.prisma.userAddress.update({ where: { id }, data: { isDefault: true } });
    }
}
