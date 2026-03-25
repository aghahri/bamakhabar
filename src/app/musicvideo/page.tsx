import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';

const SLUGS = ['music', 'video'] as const;

export async function generateMetadata() {
  return { title: 'موزیک ویدیو | باماخبر' };
}

export const revalidate = 60;

export default async function MusicVideoPage() {
  const categories = await prisma.category.findMany({
    where: { slug: { in: [...SLUGS] } },
    select: { id: true, name: true, slug: true },
  });

  const categoryIds = categories.map((c) => c.id);

  if (categoryIds.length === 0) {
    return <div className="py-10 text-center text-gray-600">دسته‌بندی موزیک/ویدیو پیدا نشد.</div>;
  }

  const news = await prisma.news.findMany({
    where: {
      published: true,
      categories: { some: { id: { in: categoryIds } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
    include: { categories: true, neighborhood: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3 mb-6">
        موزیک و ویدیو
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {news.map((n) => (
          <NewsCard
            key={n.id}
            title={n.title}
            slug={n.slug}
            summary={n.summary}
            imageUrl={n.imageUrl}
            categoryNames={n.categories.map((c) => c.name)}
            createdAt={n.createdAt}
            regionLabel={n.neighborhood ? `${n.neighborhood.name}، ${n.neighborhood.city ?? ''}` : null}
          />
        ))}
      </div>

      {news.length === 0 && (
        <p className="text-center text-gray-500 py-12">خبری در این بخش وجود ندارد.</p>
      )}
    </div>
  );
}

