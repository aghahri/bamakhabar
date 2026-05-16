/**
 * پاک‌سازی داده‌های production: جایگزینی رفرنس تصویر ناخواسته
 * '/agha-image.png' با placeholder برند باماخبر در رکوردهای خبر.
 *
 * اجرا روی سرور:
 *   npx tsx scripts/cleanup-agha-image.ts
 *
 * معادل SQL خام (PostgreSQL، نام مدل Prisma بدون @@map → جدول "News"):
 *   UPDATE "News"
 *     SET "imageUrl" = '/images/bamakhabar-news-placeholder.png'
 *     WHERE "imageUrl" = '/agha-image.png';
 *   UPDATE "News"
 *     SET "imageUrls" = array_replace("imageUrls", '/agha-image.png', '/images/bamakhabar-news-placeholder.png')
 *     WHERE '/agha-image.png' = ANY("imageUrls");
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLD = '/agha-image.png';
const NEW = '/images/bamakhabar-news-placeholder.png';

async function main() {
  const scalar = await prisma.news.updateMany({
    where: { imageUrl: OLD },
    data: { imageUrl: NEW },
  });

  // imageUrls آرایه است؛ Prisma updateMany روی عناصر آرایه کار نمی‌کند،
  // پس رکوردهای حاوی مقدار قدیمی را خوانده و دستی بازنویسی می‌کنیم.
  const withArray = await prisma.news.findMany({
    where: { imageUrls: { has: OLD } },
    select: { id: true, imageUrls: true },
  });
  for (const n of withArray) {
    await prisma.news.update({
      where: { id: n.id },
      data: { imageUrls: n.imageUrls.map((u) => (u === OLD ? NEW : u)) },
    });
  }

  console.log(`imageUrl rows updated: ${scalar.count}`);
  console.log(`imageUrls rows updated: ${withArray.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
