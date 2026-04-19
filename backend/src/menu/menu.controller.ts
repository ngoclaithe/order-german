import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    // ====== PUBLIC (active items only) ======
    @Get()
    async getMenu() {
        return this.menuService.getMenuCategories();
    }

    @Get('item/:id')
    async getMenuItem(@Param('id') id: string) {
        return this.menuService.getMenuItem(id);
    }

    // ====== ADMIN: All items (including inactive) ======
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'CASHIER')
    @Get('admin/all')
    async getAdminMenu() {
        return this.menuService.getAllMenuCategories();
    }

    // ====== ADMIN: Categories ======
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Post('categories')
    async createCategory(@Body() body: { name: string }) {
        return this.menuService.createCategory(body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Patch('categories/:id')
    async updateCategory(@Param('id') id: string, @Body() body: { name: string }) {
        return this.menuService.updateCategory(id, body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Delete('categories/:id')
    async deleteCategory(@Param('id') id: string) {
        return this.menuService.deleteCategory(id);
    }

    // ====== ADMIN: Menu Items ======
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Post('items')
    async createMenuItem(@Body() body: any) {
        return this.menuService.createMenuItem(body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Patch('items/:id')
    async updateMenuItem(@Param('id') id: string, @Body() body: any) {
        return this.menuService.updateMenuItem(id, body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Delete('items/:id')
    async deleteMenuItem(@Param('id') id: string) {
        return this.menuService.deleteMenuItem(id);
    }

    // ====== ADMIN: Topping Groups ======
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Post('topping-groups')
    async createToppingGroup(@Body() body: any) {
        return this.menuService.createToppingGroup(body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Patch('topping-groups/:id')
    async updateToppingGroup(@Param('id') id: string, @Body() body: any) {
        return this.menuService.updateToppingGroup(id, body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Delete('topping-groups/:id')
    async deleteToppingGroup(@Param('id') id: string) {
        return this.menuService.deleteToppingGroup(id);
    }

    // ====== ADMIN: Topping Options ======
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Post('topping-options')
    async createToppingOption(@Body() body: any) {
        return this.menuService.createToppingOption(body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Patch('topping-options/:id')
    async updateToppingOption(@Param('id') id: string, @Body() body: any) {
        return this.menuService.updateToppingOption(id, body);
    }
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Delete('topping-options/:id')
    async deleteToppingOption(@Param('id') id: string) {
        return this.menuService.deleteToppingOption(id);
    }
}
