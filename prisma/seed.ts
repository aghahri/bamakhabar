import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashed, name: 'مدیر باماخبر' },
  });

  const categories = [
    { name: 'اجتماعی', slug: 'ejtemaei', order: 1 },
    { name: 'فرهنگی', slug: 'farhangi', order: 2 },
    { name: 'ورزشی', slug: 'varzeshi', order: 3 },
    { name: 'اقتصاد', slug: 'eghtesad', order: 4 },
    { name: 'محیط زیست', slug: 'mohit-zist', order: 5 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const neighborhoods = [
    { name: 'تهران مرکزی', slug: 'tehran-markazi', province: 'تهران', city: 'تهران' },
    { name: 'شیراز', slug: 'shiraz', province: 'فارس', city: 'شیراز' },
    { name: 'اصفهان', slug: 'isfahan', province: 'اصفهان', city: 'اصفهان' },
  ];
  for (const n of neighborhoods) {
    await prisma.neighborhood.upsert({
      where: { slug: n.slug },
      update: {},
      create: n,
    });
  }

  console.log('Seed completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
