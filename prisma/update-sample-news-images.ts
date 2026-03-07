/**
 * برای اخبار نمونه‌ای که قبلاً بدون عکس ساخته شده‌اند: یک تصویر placeholder ست می‌کند.
 * یک بار اجرا کافی است: npx tsx prisma/update-sample-news-images.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const list = await prisma.news.findMany({
    where: {
      slug: { startsWith: 'sample-' },
      imageUrl: null,
    },
    select: { id: true, slug: true },
  });
  let updated = 0;
  for (const n of list) {
    const seed = n.slug.replace(/[^a-z0-9-]/gi, '').slice(0, 30) || n.id;
    const imageUrl = `https://picsum.photos/seed/${seed}/800/500`;
    await prisma.news.update({
      where: { id: n.id },
      data: { imageUrl },
    });
    updated++;
  }
  console.log('تعداد اخبار نمونه بدون عکس که بروزرسانی شد:', updated);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
