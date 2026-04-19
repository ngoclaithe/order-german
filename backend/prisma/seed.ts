import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing database...');
    await prisma.orderItemTopping.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.toppingOption.deleteMany();
    await prisma.toppingGroup.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.userAddress.deleteMany();
    await prisma.user.deleteMany();

    console.log('Seeding data...');

    // Hash the admin password properly
    const hashedPassword = await argon2.hash('admin123');

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@order-german.com' },
        update: {},
        create: {
            email: 'admin@order-german.com',
            password: hashedPassword,
            role: 'ADMIN',
            phone: '0123456789',
        },
    });

    // Create Categories
    const catBurger = await prisma.menuCategory.create({
        data: {
            name: 'Burgers',
            items: {
                create: [
                    {
                        name: 'Classic Cheeseburger',
                        description: '100% Angus beef with cheddar cheese, lettuce, tomato, and house sauce.',
                        price: 8.99,
                        imageUrl: '/images/burger.png'
                    },
                    {
                        name: 'Double Bacon Burger',
                        description: 'Double beef patty, crispy bacon, american cheese, pickle.',
                        price: 12.99,
                        originalPrice: 15.99,
                        imageUrl: '/images/burger_2.png'
                    }
                ]
            }
        }
    });

    const catDrinks = await prisma.menuCategory.create({
        data: {
            name: 'Drinks',
            items: {
                create: [
                    {
                        name: 'Coca Cola',
                        description: 'Ice cold 330ml',
                        price: 1.99,
                        imageUrl: '/images/coca_cola.png'
                    },
                    {
                        name: 'Pepsi',
                        description: 'Ice cold 330ml',
                        price: 1.99,
                        imageUrl: '/images/pepsi.png'
                    }
                ]
            }
        }
    });

    // Add toppings to Classic Cheeseburger
    const cheeseburger = await prisma.menuItem.findFirst({
        where: { name: 'Classic Cheeseburger' }
    });

    if (cheeseburger) {
        await prisma.toppingGroup.create({
            data: {
                name: 'Extra Toppings',
                requiresSelection: false,
                multipleSelection: true,
                menuItemId: cheeseburger.id,
                options: {
                    create: [
                        { name: 'Extra Cheese', price: 1.00 },
                        { name: 'Bacon', price: 1.50 },
                        { name: 'Jalapenos', price: 0.50 }
                    ]
                }
            }
        });

        await prisma.toppingGroup.create({
            data: {
                name: 'Size',
                requiresSelection: true,
                multipleSelection: false,
                menuItemId: cheeseburger.id,
                options: {
                    create: [
                        { name: 'Regular', price: 0 },
                        { name: 'Large (double patty)', price: 4.00 }
                    ]
                }
            }
        });
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
