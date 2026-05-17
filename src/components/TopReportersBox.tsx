import { prisma } from '@/lib/prisma';
import { toPersianDigits } from '@/lib/persian';

/** خبرنگاران برتر بر اساس دادهٔ واقعی: تعداد اخبار تاییدشده/منتشرشده و مجموع بازدید. */
export async function TopReportersBox() {
  let rows: {
    id: string;
    name: string;
    neighborhood: string | null;
    count: number;
    views: number;
  }[] = [];
  try {
    const groups = await prisma.news.groupBy({
      by: ['createdById'],
      where: {
        createdById: { not: null },
        published: true,
        reviewStatus: 'APPROVED',
      },
      _sum: { viewCount: true },
      _count: true,
    });
    const top = groups
      .sort(
        (a, b) =>
          (b._sum.viewCount ?? 0) - (a._sum.viewCount ?? 0) || b._count - a._count
      )
      .slice(0, 5);
    if (top.length === 0) return null;
    const users = await prisma.user.findMany({
      where: { id: { in: top.map((g) => g.createdById as string) } },
      select: {
        id: true,
        name: true,
        username: true,
        neighborhood: { select: { name: true } },
      },
    });
    const map = new Map(users.map((u) => [u.id, u]));
    rows = top
      .map((g) => {
        const u = map.get(g.createdById as string);
        if (!u) return null;
        return {
          id: u.id,
          name: u.name || u.username,
          neighborhood: u.neighborhood?.name ?? null,
          count: g._count,
          views: g._sum.viewCount ?? 0,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  } catch (err) {
    console.error('TopReportersBox DB error:', err);
    return null;
  }

  if (rows.length === 0) return null;

  return (
    <div dir="rtl" className="news-card p-4">
      <h2 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
        خبرنگاران برتر
      </h2>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 w-6 text-center">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : toPersianDigits(i + 1)}
            </span>
            <span className="flex-1 min-w-0 text-gray-700 line-clamp-2">
              {r.name}
              {r.neighborhood ? (
                <span className="text-gray-400"> · {r.neighborhood}</span>
              ) : null}
            </span>
            <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
              {toPersianDigits(r.count)} خبر
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
