import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'na5893395@gmail.com' },
    update: {},
    create: {
      email: 'na5893395@gmail.com',
      username: 'admin',
      displayName: 'Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Admin user created:', admin.email);

  // Create sample playground
  const playground = await prisma.playground.upsert({
    where: { slug: 'best-programming-languages' },
    update: {},
    create: {
      title: 'Best Programming Languages 2024',
      description: 'Rank the best programming languages based on your experience',
      slug: 'best-programming-languages',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
    },
  });

  // Create tiers
  const tierData = [
    { name: 'S', label: 'S Tier', color: '#FF7F7F', score: 5, orderIndex: 0 },
    { name: 'A', label: 'A Tier', color: '#FFBF7F', score: 4, orderIndex: 1 },
    { name: 'B', label: 'B Tier', color: '#FFFF7F', score: 3, orderIndex: 2 },
    { name: 'C', label: 'C Tier', color: '#7FFF7F', score: 2, orderIndex: 3 },
    { name: 'D', label: 'D Tier', color: '#7F7FFF', score: 1, orderIndex: 4 },
  ];

  for (const tier of tierData) {
    await prisma.tier.upsert({
      where: {
        playgroundId_orderIndex: {
          playgroundId: playground.id,
          orderIndex: tier.orderIndex,
        },
      },
      update: {},
      create: { ...tier, playgroundId: playground.id },
    });
  }

  // Create sample items
  const items = [
    'TypeScript', 'Python', 'Rust', 'Go', 'JavaScript',
    'Java', 'C++', 'C#', 'Kotlin', 'Swift',
  ];

  for (let i = 0; i < items.length; i++) {
    await prisma.item.upsert({
      where: { id: `seed-item-${i}` },
      update: {},
      create: {
        id: `seed-item-${i}`,
        name: items[i],
        orderIndex: i,
        playgroundId: playground.id,
      },
    });
  }

  // Create analytics record
  await prisma.playgroundAnalytics.upsert({
    where: { playgroundId: playground.id },
    update: {},
    create: { playgroundId: playground.id },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
