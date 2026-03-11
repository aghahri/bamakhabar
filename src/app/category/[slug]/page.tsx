import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';

const SLUG_ALIASES: Record<string, string[]> = {
  siasi: ['siasi', 'سیاسی'],
  nezami: ['nezami', 'نظامی'],
};

async function findCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (category) return category;
  const aliases = SLUG_ALIASES[slug];
  if (aliases) {
    return prisma.category.findFirst({
      where: { OR: aliases.map((s) => ({ slug: s })) },
    });
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await findCategoryBySlug(slug);
  if (!cat) return { title: 'دسته‌بندی' };
  return { title: `${cat.name} | باماخبر` };
}

export const revalidate = 60;

// در بیلد (مثلاً Render) به DB دسترسی نیست؛ از پیش‌رندر دسته‌ها صرف‌نظر می‌کنیم

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();

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
            regionLabel={n.neighborhood ? `${n.neighborhood.name}، ${n.neighborhood.city ?? ''}` : null}
          />
        ))}
      </div>
      {news.length === 0 && (
        <p className="text-center text-gray-500 py-12">خبری در این دسته وجود ندارد.</p>
      )}
    </div>
  );
}
