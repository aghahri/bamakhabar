import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    prisma.news.findFirst({
      where: { published: true, featured: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 11,
      include: { category: true },
    }),
  ]);

  const rest = latest.filter((n) => n.id !== featured?.id).slice(0, 10);

  return (
    <div className="container-custom py-6">
      <section className="mb-8">
        {featured ? (
          <NewsCard
            title={featured.title}
            slug={featured.slug}
            summary={featured.summary}
            imageUrl={featured.imageUrl}
            categoryName={featured.category.name}
            createdAt={featured.createdAt}
            featured
          />
        ) : (
          <div className="news-card p-12 text-center text-gray-500">
            <p>خبر شاخصی در حال حاضر وجود ندارد.</p>
            <Link href="/admin" className="text-[var(--bama-primary)] mt-2 inline-block">
              ورود به پنل ادمین
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-4">
          آخرین اخبار
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rest.map((news) => (
            <NewsCard
              key={news.id}
              title={news.title}
              slug={news.slug}
              summary={news.summary}
              imageUrl={news.imageUrl}
              categoryName={news.category.name}
              createdAt={news.createdAt}
            />
          ))}
        </div>
        {rest.length === 0 && !featured && (
          <p className="text-center text-gray-500 py-8">خبری منتشر نشده است.</p>
        )}
      </section>
    </div>
  );
}
