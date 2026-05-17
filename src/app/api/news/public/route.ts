import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_TAKE = 12;
const MAX_TAKE = 30;

/** خروجی عمومی فهرست اخبار منتشرشده برای اسکرول بی‌نهایت (بدون احراز هویت). */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const skip = Math.max(0, parseInt(sp.get('skip') ?? '0', 10) || 0);
  const take = Math.min(
    MAX_TAKE,
    Math.max(1, parseInt(sp.get('take') ?? String(DEFAULT_TAKE), 10) || DEFAULT_TAKE)
  );

  try {
    const rows = await prisma.news.findMany({
      where: { published: true, reviewStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: take + 1, // یکی بیشتر برای تشخیص ادامه‌داشتن
      include: { categories: true, neighborhood: true },
    });
    const hasMore = rows.length > take;
    const items = rows.slice(0, take).map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      summary: n.summary,
      imageUrl: n.imageUrl,
      categoryNames: n.categories.map((c) => c.name),
      createdAt: n.createdAt.toISOString(),
      regionLabel: n.neighborhood
        ? `${n.neighborhood.name}، ${n.neighborhood.city ?? ''}`
        : null,
    }));
    return NextResponse.json({ items, hasMore, nextSkip: skip + items.length });
  } catch (err) {
    console.error('public news list error:', err);
    return NextResponse.json({ error: 'خطا در دریافت اخبار' }, { status: 500 });
  }
}
