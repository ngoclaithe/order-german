import { Controller, Post, Body, Get, Req, UseGuards, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
class OptionalJwtGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
    handleRequest(err: any, user: any) {
        return user || null;
    }
}

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(OptionalJwtGuard)
    @Post()
    async createOrder(@Req() req: Request, @Body() body: any) {
        const userId = (req.user as any)?.id || null;
        return this.ordersService.createOrder(userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-orders')
    async getMyOrders(@Req() req: Request) {
        return this.ordersService.getMyOrders((req.user as any).id);
    }

    @Get('stats')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'CASHIER')
    async getStats() {
        return this.ordersService.getStats();
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'CASHIER')
    async getAllOrders() {
        return this.ordersService.getAllOrders();
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'CASHIER')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string; cancelNote?: string; shippingFee?: number }) {
        return this.ordersService.updateOrderStatus(id, body.status, body.cancelNote, body.shippingFee);
    }

    @Patch(':id/shipping')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'CASHIER')
    async updateShipping(@Param('id') id: string, @Body() body: { shippingFee: number }) {
        return this.ordersService.updateShippingFee(id, body.shippingFee);
    }
}
