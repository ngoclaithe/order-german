import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async getFullProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new UnauthorizedException('User not found');
        const { password, ...profile } = user;
        return profile;
    }

    async login(loginDto: any) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await argon2.verify(user.password, loginDto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                whatsapp: user.whatsapp,
                telegram: user.telegram,
            }
        };
    }

    async register(registerDto: any) {
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await argon2.hash(registerDto.password);
        const user = await this.usersService.createUser({
            email: registerDto.email,
            password: hashedPassword,
            phone: registerDto.phone,
            address: registerDto.address,
            whatsapp: registerDto.whatsapp,
            telegram: registerDto.telegram,
        });

        // Auto-create default address from registration data
        if (registerDto.address && registerDto.phone) {
            // Use the injected usersService's update workaround - create address via raw
            await this.usersService.createDefaultAddress(user.id, {
                label: 'Home',
                address: registerDto.address,
                phone: registerDto.phone,
            });
        }

        return this.login({ email: user.email, password: registerDto.password });
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists
            return { message: 'If an account with this email exists, a new password has been sent.' };
        }

        // Generate random 8-char password
        const newPassword = randomBytes(4).toString('hex'); // e.g. "a3f1b2c4"
        const hashed = await argon2.hash(newPassword);

        // Update user password
        await this.usersService.update(user.id, { password: hashed });

        // Send email
        await this.mailService.sendNewPassword(email, newPassword);

        return { message: 'If an account with this email exists, a new password has been sent.' };
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new UnauthorizedException('User not found');

        const isOldValid = await argon2.verify(user.password, oldPassword);
        if (!isOldValid) throw new BadRequestException('Current password is incorrect');

        const hashed = await argon2.hash(newPassword);
        await this.usersService.update(userId, { password: hashed });
        return { message: 'Password changed successfully' };
    }
}
