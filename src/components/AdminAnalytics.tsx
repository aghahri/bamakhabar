import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPersianNumber, toPersianDigits } from '@/lib/persian';

interface Props {
  from: Date;
  to: Date;
  fromStr: string;
  toStr: string;
  scopeNeighborhoodId?: string | null;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-r-4 ${accent}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 tabular-nums mt-1">
        {formatPersianNumber(value)}
      </p>
    </div>
  );
}

export async function AdminAnalytics({
  from,
  to,
  fromStr,
  toStr,
  scopeNeighborhoodId = null,
}: Props) {
  const baseWhere = {
    createdAt: { gte: from, lte: to },
    ...(scopeNeighborhoodId ? { neighborhoodId: scopeNeighborhoodId } : {}),
  };

  let data: {
    newsCount: number;
    totalViews: number;
    publishedCount: number;
    breakingCount: number;
    videoCount: number;
    topNews: { id: string; title: string; slug: string; viewCount: number }[];
    hoods: { id: string; name: string; city: string | null; views: number; count: number }[];
    reporters: { id: string; name: string; count: number; views: number }[];
  } | null = null;

  try {
    const [
      newsCount,
      viewsAgg,
      publishedCount,
      breakingCount,
      videoCount,
      topNews,
      hoodGroups,
      reporterGroups,
    ] = await Promise.all([
      prisma.news.count({ where: baseWhere }),
      prisma.news.aggregate({ where: baseWhere, _sum: { viewCount: true } }),
      prisma.news.count({ where: { ...baseWhere, published: true } }),
      prisma.news.count({ where: { ...baseWhere, published: true, isBreaking: true } }),
      prisma.news.count({
        where: {
          ...baseWhere,
          OR: [{ videoUrl: { not: null } }, { videoUrls: { isEmpty: false } }],
        },
      }),
      prisma.news.findMany({
        where: baseWhere,
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true },
      }),
      prisma.news.groupBy({
        by: ['neighborhoodId'],
        where: { ...baseWhere, neighborhoodId: { not: null } },
        _sum: { viewCount: true },
        _count: true,
      }),
      prisma.news.groupBy({
        by: ['createdById'],
        where: { ...baseWhere, createdById: { not: null } },
        _sum: { viewCount: true },
        _count: true,
      }),
    ]);

    const topHoodGroups = [...hoodGroups]
      .sort((a, b) => (b._sum.viewCount ?? 0) - (a._sum.viewCount ?? 0))
      .slice(0, 5);
    const hoodMeta = topHoodGroups.length
      ? await prisma.neighborhood.findMany({
          where: { id: { in: topHoodGroups.map((g) => g.neighborhoodId as string) } },
          select: { id: true, name: true, city: true },
        })
      : [];
    const hoodMap = new Map(hoodMeta.map((h) => [h.id, h]));
    const hoods = topHoodGroups
      .map((g) => {
        const meta = hoodMap.get(g.neighborhoodId as string);
        if (!meta) return null;
        return {
          id: meta.id,
          name: meta.name,
          city: meta.city,
          views: g._sum.viewCount ?? 0,
          count: g._count,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const topReporterGroups = [...reporterGroups]
      .sort((a, b) => b._count - a._count)
      .slice(0, 5);
    const reporterMeta = topReporterGroups.length
      ? await prisma.user.findMany({
          where: { id: { in: topReporterGroups.map((g) => g.createdById as string) } },
          select: { id: true, name: true, username: true },
        })
      : [];
    const repMap = new Map(reporterMeta.map((u) => [u.id, u]));
    const reporters = topReporterGroups
      .map((g) => {
        const meta = repMap.get(g.createdById as string);
        if (!meta) return null;
        return {
          id: meta.id,
          name: meta.name || meta.username,
          count: g._count,
          views: g._sum.viewCount ?? 0,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    data = {
      newsCount,
      totalViews: viewsAgg._sum.viewCount ?? 0,
      publishedCount,
      breakingCount,
      videoCount,
      topNews,
      hoods,
      reporters,
    };
  } catch (err) {
    console.error('AdminAnalytics DB error:', err);
    return null;
  }

  return (
    <section dir="rtl" className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3">
          تحلیل و آمار
        </h2>
        <form
          method="get"
          action="/admin"
          className="flex flex-wrap items-end gap-2 text-sm"
        >
          <label className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">از تاریخ</span>
            <input
              type="date"
              name="from"
              defaultValue={fromStr}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">تا تاریخ</span>
            <input
              type="date"
              name="to"
              defaultValue={toStr}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>
          <button type="submit" className="btn-primary py-1.5">
            اعمال بازه
          </button>
          <Link
            href="/admin"
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
          >
            امروز
          </Link>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <StatCard
          label="تعداد خبر امروز"
          value={data.newsCount}
          accent="border-[var(--bama-primary)]"
        />
        <StatCard label="کل بازدید امروز" value={data.totalViews} accent="border-blue-500" />
        <StatCard
          label="خبرهای فوری فعال"
          value={data.breakingCount}
          accent="border-red-500"
        />
        <StatCard label="تعداد ویدیوها" value={data.videoCount} accent="border-purple-500" />
        <StatCard
          label="اخبار منتشرشده در بازه"
          value={data.publishedCount}
          accent="border-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">پربازدیدترین خبرها</h3>
          {data.topNews.length > 0 ? (
            <ol className="space-y-2">
              {data.topNews.map((n, i) => (
                <li key={n.id} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--bama-primary)] text-white text-xs flex items-center justify-center">
                    {toPersianDigits(i + 1)}
                  </span>
                  <Link
                    href={`/news/${n.slug}`}
                    target="_blank"
                    className="flex-1 min-w-0 text-gray-700 hover:text-[var(--bama-primary)] line-clamp-2"
                  >
                    {n.title}
                  </Link>
                  <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
                    {formatPersianNumber(n.viewCount)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400">داده‌ای در این بازه نیست.</p>
          )}
        </div>

        {data.hoods.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">داغ‌ترین محله‌ها</h3>
            <ol className="space-y-2">
              {data.hoods.map((h, i) => (
                <li key={h.id} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center">
                    {toPersianDigits(i + 1)}
                  </span>
                  <span className="flex-1 min-w-0 text-gray-700 line-clamp-2">
                    {h.name}
                    {h.city ? <span className="text-gray-400"> · {h.city}</span> : null}
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
                    {formatPersianNumber(h.views)} بازدید
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {data.reporters.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">عملکرد خبرنگاران</h3>
            <ol className="space-y-2">
              {data.reporters.map((r, i) => (
                <li key={r.id} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center">
                    {toPersianDigits(i + 1)}
                  </span>
                  <span className="flex-1 min-w-0 text-gray-700 line-clamp-2">{r.name}</span>
                  <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
                    {formatPersianNumber(r.count)} خبر · {formatPersianNumber(r.views)} بازدید
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
