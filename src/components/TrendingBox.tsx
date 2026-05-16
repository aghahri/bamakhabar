import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { toPersianDigits } from '@/lib/persian';

export async function TrendingBox() {
  let items: { id: string; slug: string; title: string; viewCount: number }[] = [];
  try {
    items = await prisma.news.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true, slug: true, title: true, viewCount: true },
    });
  } catch (err) {
    console.error('TrendingBox DB error:', err);
    return null;
  }

  // اگر هیچ بازدیدی ثبت نشده، باکس را نشان نده
  if (items.length === 0 || items.every((n) => n.viewCount === 0)) return null;

  return (
    <div dir="rtl" className="news-card p-4">
      <h2 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
        پربازدیدترین خبرها
      </h2>
      <ol className="space-y-2">
        {items.map((n, i) => (
          <li key={n.id} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--bama-primary)] text-white text-xs flex items-center justify-center">
              {toPersianDigits(i + 1)}
            </span>
            <Link
              href={`/news/${n.slug}`}
              className="flex-1 min-w-0 text-gray-700 hover:text-[var(--bama-primary)] line-clamp-2"
            >
              {n.title}
            </Link>
            <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
              {toPersianDigits(n.viewCount)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
