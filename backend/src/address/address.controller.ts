import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('addresses')
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAddresses(@Req() req: Request) {
        return this.addressService.getAddresses((req.user as any).id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async createAddress(@Req() req: Request, @Body() body: { label: string; address: string; phone: string; isDefault?: boolean }) {
        return this.addressService.createAddress((req.user as any).id, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async updateAddress(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
        return this.addressService.updateAddress((req.user as any).id, id, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteAddress(@Req() req: Request, @Param('id') id: string) {
        return this.addressService.deleteAddress((req.user as any).id, id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/default')
    async setDefault(@Req() req: Request, @Param('id') id: string) {
        return this.addressService.setDefault((req.user as any).id, id);
    }
}
