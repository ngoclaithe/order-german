import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(body);

        // HTTP-Only Cookie
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return result.user;
    }

    @Post('register')
    async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(body);

        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return result.user;
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return { success: true };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getProfile(@Req() req: Request) {
        const userId = (req.user as any).id;
        // Import UsersService via AuthService
        const user = await this.authService.getFullProfile(userId);
        return user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    async changePassword(@Req() req: Request, @Body() body: { oldPassword: string; newPassword: string }) {
        return this.authService.changePassword((req.user as any).id, body.oldPassword, body.newPassword);
    }
}
