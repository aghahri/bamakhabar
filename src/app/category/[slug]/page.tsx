import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: 'دسته‌بندی' };
  return { title: `${cat.name} | باماخبر` };
}

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const news = await prisma.news.findMany({
    where: { categoryId: category.id, published: true },
    orderBy: { createdAt: 'desc' },
    take: 24,
    include: { category: true },
  });

  return (
    <div className="container-custom py-6">
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
            categoryName={n.category.name}
            createdAt={n.createdAt}
          />
        ))}
      </div>
      {news.length === 0 && (
        <p className="text-center text-gray-500 py-12">خبری در این دسته وجود ندارد.</p>
      )}
    </div>
  );
}
