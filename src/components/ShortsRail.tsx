import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NewsImage } from '@/components/NewsImage';

/** ریل سبک پیش‌نمایش «باما شورت» در صفحهٔ اصلی — فقط اگر شورت موجود باشد. */
export async function ShortsRail() {
  let rows: { id: string; slug: string; title: string; poster: string | null }[] = [];
  try {
    const list = await prisma.news.findMany({
      where: {
        published: true,
        reviewStatus: 'APPROVED',
        isShort: true,
        OR: [{ videoUrl: { not: null } }, { videoUrls: { isEmpty: false } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        videoThumbnailUrl: true,
        imageUrl: true,
      },
    });
    rows = list.map((n) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      poster: n.videoThumbnailUrl || n.imageUrl || null,
    }));
  } catch (err) {
    console.error('ShortsRail DB error:', err);
    return null;
  }

  if (rows.length === 0) return null;

  return (
    <section dir="rtl" className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3">
          باما شورت
        </h2>
        <Link href="/shorts" className="text-sm text-[var(--bama-primary)] hover:underline">
          همهٔ شورت‌ها
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {rows.map((n) => (
          <Link
            key={n.id}
            href={`/news/${n.slug}`}
            className="group flex-shrink-0 w-32 sm:w-36"
          >
            <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-200">
              <NewsImage
                src={n.poster}
                alt={n.title}
                fill
                className="group-hover:scale-105 transition-transform duration-300"
                sizes="144px"
              />
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                ▶ شورت
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-700 line-clamp-2 group-hover:text-[var(--bama-primary)]">
              {n.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
