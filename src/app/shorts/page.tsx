import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ShortsFeed, type ShortItem } from '@/components/ShortsFeed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'باما شورت | باماخبر',
  description: 'ویدیوهای کوتاه خبری محلات کشور',
};

function resolveMedia(src: string): string {
  if (!src) return src;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/uploads/')) return `/api/media${src}`;
  if (src.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${src}`;
  return src;
}

export default async function ShortsPage() {
  let items: ShortItem[] = [];
  try {
    const rows = await prisma.news.findMany({
      where: {
        published: true,
        reviewStatus: 'APPROVED',
        isShort: true,
        OR: [{ videoUrl: { not: null } }, { videoUrls: { isEmpty: false } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { neighborhood: { select: { name: true } } },
    });
    items = rows
      .map((n) => {
        const rawVideo =
          (Array.isArray(n.videoUrls) && n.videoUrls.length > 0
            ? n.videoUrls[0]
            : n.videoUrl) || null;
        if (!rawVideo) return null;
        const rawPoster = n.videoThumbnailUrl || n.imageUrl || null;
        return {
          id: n.id,
          slug: n.slug,
          title: n.title,
          summary: n.summary,
          viewCount: n.viewCount,
          neighborhood: n.neighborhood?.name ?? null,
          videoSrc: resolveMedia(rawVideo),
          poster: rawPoster ? resolveMedia(rawPoster) : null,
        };
      })
      .filter((x): x is ShortItem => x !== null);
  } catch (err) {
    console.error('ShortsPage DB error:', err);
    items = [];
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3">
          باما شورت
        </h1>
        <Link href="/" className="text-sm text-[var(--bama-primary)] hover:underline">
          بازگشت به خانه
        </Link>
      </div>
      {items.length > 0 ? (
        <ShortsFeed items={items} />
      ) : (
        <p className="text-center text-gray-500 py-16">
          فعلاً ویدیوی کوتاهی برای نمایش وجود ندارد.
        </p>
      )}
    </div>
  );
}
