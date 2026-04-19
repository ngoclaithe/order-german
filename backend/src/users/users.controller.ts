import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Post()
    async createUser(@Body() body: { email: string; password: string; phone?: string; address?: string; role?: string }) {
        return this.usersService.adminCreateUser(body);
    }

    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() body: any) {
        return this.usersService.adminUpdateUser(id, body);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return this.usersService.adminDeleteUser(id);
    }
}
