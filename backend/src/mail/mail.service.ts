import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_APP_PASSWORD,
            },
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        return this.transporter.sendMail({
            from: `"Order German" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
        });
    }

    async sendNewPassword(to: string, newPassword: string) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
                <h2 style="color: #059669; margin-bottom: 8px;">🔑 Password Reset</h2>
                <p style="color: #374151;">Your password has been reset. Here is your new temporary password:</p>
                <div style="background: #111827; color: #34d399; font-family: monospace; font-size: 24px; padding: 16px 24px; border-radius: 12px; text-align: center; margin: 20px 0; letter-spacing: 4px;">
                    ${newPassword}
                </div>
                <p style="color: #6b7280; font-size: 14px;">Please login and change your password immediately.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">Order German © ${new Date().getFullYear()}</p>
            </div>
        `;
        return this.sendMail(to, '🔑 Your New Password - Order German', html);
    }
}
