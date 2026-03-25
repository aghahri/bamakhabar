import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';

const CATEGORY_SLUG = 'video';

export async function generateMetadata() {
  const cat = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!cat) return { title: 'ویدیو | باماخبر' };
  return { title: `${cat.name} | باماخبر` };
}

export const revalidate = 60;

export default async function VideoPage() {
  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });

  if (!category) {
    return (
      <div className="py-10 text-center text-gray-600">
        دسته‌بندی ویدیو پیدا نشد.
      </div>
    );
  }

  const news = await prisma.news.findMany({
    where: {
      categories: { some: { id: category.id } },
      published: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
    include: { categories: true, neighborhood: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3 mb-6">
        {category.name}
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
            regionLabel={
              n.neighborhood ? `${n.neighborhood.name}، ${n.neighborhood.city ?? ''}` : null
            }
          />
        ))}
      </div>

      {news.length === 0 && (
        <p className="text-center text-gray-500 py-12">خبری در این دسته وجود ندارد.</p>
      )}
    </div>
  );
}

