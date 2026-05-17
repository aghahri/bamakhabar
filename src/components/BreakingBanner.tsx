import { prisma } from '@/lib/prisma';
import { BreakingBannerClient, type BreakingItem } from './BreakingBannerClient';

export async function BreakingBanner() {
  let items: BreakingItem[] = [];
  try {
    items = await prisma.news.findMany({
      where: { published: true, isBreaking: true, reviewStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, slug: true, title: true },
    });
  } catch (err) {
    console.error('BreakingBanner DB error:', err);
    return null;
  }
  if (items.length === 0) return null;
  return <BreakingBannerClient items={items} />;
}
