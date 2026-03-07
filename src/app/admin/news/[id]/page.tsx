import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NewsForm } from '@/components/NewsForm';

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id },
    include: { categories: true, neighborhood: true },
  });
  if (!news) notFound();
  const reporterNeighborhoodId = session.type === 'user' ? session.neighborhoodId : null;
  const isReporter = session.type === 'user' && session.role === 'REPORTER';
  if (isReporter && news.neighborhoodId !== reporterNeighborhoodId) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ویرایش خبر</h1>
      <NewsForm
        id={news.id}
        defaultTitle={news.title}
        defaultSummary={news.summary}
        defaultBody={news.body}
        defaultImageUrl={news.imageUrl}
        defaultVideoUrl={news.videoUrl}
        defaultCategoryIds={news.categories.map((c) => c.id)}
        defaultNeighborhoodId={news.neighborhoodId}
        defaultPublished={news.published}
        defaultFeatured={news.featured}
        isReporter={isReporter}
        reporterNeighborhoodId={reporterNeighborhoodId}
      />
    </div>
  );
}
