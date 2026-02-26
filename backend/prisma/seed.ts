import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create default packages
    const packages = [
        {
            name: 'Free',
            maxFolders: 5,
            maxNestingLevel: 1,
            allowedFileTypes: ['Image', 'PDF'],
            maxFileSizeMB: 5,
            totalFileLimit: 10,
            filesPerFolder: 5,
        },
        {
            name: 'Silver',
            maxFolders: 20,
            maxNestingLevel: 3,
            allowedFileTypes: ['Image', 'PDF', 'Audio'],
            maxFileSizeMB: 20,
            totalFileLimit: 100,
            filesPerFolder: 20,
        },
        {
            name: 'Gold',
            maxFolders: 100,
            maxNestingLevel: 10,
            allowedFileTypes: ['Image', 'PDF', 'Audio', 'Video'],
            maxFileSizeMB: 100,
            totalFileLimit: 1000,
            filesPerFolder: 100,
        },
        {
            name: 'Diamond',
            maxFolders: 1000,
            maxNestingLevel: 100,
            allowedFileTypes: ['Image', 'PDF', 'Audio', 'Video'],
            maxFileSizeMB: 1000,
            totalFileLimit: 10000,
            filesPerFolder: 1000,
        },
    ];

    for (const pkg of packages) {
        await prisma.package.upsert({
            where: { name: pkg.name },
            update: pkg,
            create: pkg,
        });
    }

    // Create default admin
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
