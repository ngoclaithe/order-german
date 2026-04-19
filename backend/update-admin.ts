import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
async function main() {
    const hash = await argon2.hash('admin123');
    await prisma.user.updateMany({
        where: { email: 'admin@order-german.com' },
        data: { password: hash }
    });
    console.log('Admin password updated successfully.');
}
main();
