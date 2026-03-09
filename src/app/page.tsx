import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';
import { FeaturedSlider } from '@/components/FeaturedSlider';
import { NeighborhoodRanking } from '@/components/NeighborhoodRanking';
import { getNeighborhoodRanking } from '@/lib/locations';

export const revalidate = 60;

async function getHomeData() {
  const [featuredList, latest, ranking] = await Promise.all([
    prisma.news.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { categories: true },
    }),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 16,
      include: { categories: true },
    }),
    getNeighborhoodRanking(),
  ]);
  const featuredIds = new Set(featuredList.map((n) => n.id));
  const rest = latest.filter((n) => !featuredIds.has(n.id)).slice(0, 12);
  return { featuredList, rest, ranking };
}

export default async function HomePage() {
  let featuredList: Awaited<ReturnType<typeof getHomeData>>['featuredList'];
  let rest: Awaited<ReturnType<typeof getHomeData>>['rest'];
  let ranking: Awaited<ReturnType<typeof getHomeData>>['ranking'];
  let dbError = false;

  try {
    const data = await getHomeData();
    featuredList = data.featuredList;
    rest = data.rest;
    ranking = data.ranking;
  } catch (err) {
    console.error('HomePage DB error:', err);
    featuredList = [];
    rest = [];
    ranking = { red: [], yellow: [], green: [] };
    dbError = true;
  }

  return (
    <div>
      {dbError && (
        <div className="news-card p-4 mb-6 text-center text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
          <p>در حال حاضر امکان بارگذاری اخبار وجود ندارد. اتصال به پایگاه داده را بررسی کنید.</p>
        </div>
      )}
      <section className="mb-8">
        {featuredList.length > 0 ? (
          <FeaturedSlider
            items={featuredList.map((n) => ({
              id: n.id,
              title: n.title,
              slug: n.slug,
              summary: n.summary,
              imageUrl: n.imageUrl,
              categoryNames: n.categories.map((c) => c.name),
              createdAt: n.createdAt,
            }))}
          />
        ) : (
          <div className="news-card p-12 text-center text-gray-500">
            <p>خبر مهمی برای اسلایدر در حال حاضر انتخاب نشده است.</p>
            <Link href="/admin" className="text-[var(--bama-primary)] mt-2 inline-block">
              ورود به پنل ادمین
            </Link>
          </div>
        )}
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-80 flex-shrink-0 lg:order-1 order-2">
          <NeighborhoodRanking ranking={ranking} sidebar />
        </aside>
        <section className="flex-1 min-w-0 lg:order-2 order-1">
          <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-4">
            آخرین اخبار
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {rest.map((news) => (
              <NewsCard
                key={news.id}
                title={news.title}
                slug={news.slug}
                summary={news.summary}
                imageUrl={news.imageUrl}
                categoryNames={news.categories.map((c) => c.name)}
                createdAt={news.createdAt}
              />
            ))}
          </div>
          {rest.length === 0 && featuredList.length === 0 && (
            <p className="text-center text-gray-500 py-8">خبری منتشر نشده است.</p>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-4">
              نقشه و اطلاعات محلات
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              نقشه محلات و لینک گروه‌های محلی از ایران‌ریجنز — در همین صفحه مشاهده کنید.
            </p>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <iframe
                src={process.env.NEXT_PUBLIC_IRANREGIONS_URL || 'https://iranregions.com'}
                title="نقشه محلات ایران - ایران‌ریجنز"
                className="w-full h-[520px] min-h-[400px] border-0"
                allow="fullscreen"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              در صورت عدم نمایش،{' '}
              <a
                href={process.env.NEXT_PUBLIC_IRANREGIONS_URL || 'https://iranregions.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--bama-primary)] hover:underline"
              >
                نقشه محلات
              </a>
              {' '}را در پنجره جدید باز کنید.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}
