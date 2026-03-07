import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { computeStatusFromNews } from '@/lib/neighborhood-status';

const DAYS = 14;

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const neighborhoods = await prisma.neighborhood.findMany({
    include: {
      news: {
        where: { published: true, createdAt: { gte: since } },
        include: { categories: { select: { slug: true } } },
      },
    },
  });

  let updated = 0;
  for (const n of neighborhoods) {
    const { score, color } = computeStatusFromNews(
      n.news.map((news) => ({
        title: news.title,
        summary: news.summary,
        body: news.body,
        categories: news.categories,
      }))
    );
    await prisma.neighborhood.update({
      where: { id: n.id },
      data: { statusScore: score, statusColor: color, statusUpdatedAt: new Date() },
    });
    updated++;
  }

  return NextResponse.json({ success: true, updated });
}
