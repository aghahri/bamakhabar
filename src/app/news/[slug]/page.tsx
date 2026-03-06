import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NewsImage } from '@/components/NewsImage';
import { renderBody } from '@/lib/sanitize';
import { toPersianDigits } from '@/lib/persian';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({ where: { slug, published: true } });
  if (!news) return { title: 'خبر' };
  return {
    title: `${news.title} | باماخبر`,
    description: news.summary ?? undefined,
  };
}

export const revalidate = 60;

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug, published: true },
    include: { categories: true, neighborhood: true },
  });
  if (!news) notFound();

  await prisma.news.update({
    where: { id: news.id },
    data: { viewCount: { increment: 1 } },
  });

  const dateStr = new Date(news.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = toPersianDigits(dateStr);

  const htmlBody = renderBody(news.body);

  return (
    <article className="max-w-4xl">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        {news.categories.map((cat) => (
          <span key={cat.id}>
            <span className="mx-2">/</span>
            <Link href={`/category/${cat.slug}`} className="hover:text-[var(--bama-primary)]">
              {cat.name}
            </Link>
          </span>
        ))}
        {news.neighborhood && (
          <>
            <span className="mx-2">/</span>
            <span>{news.neighborhood.name}</span>
          </>
        )}
      </nav>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {news.title}
        </h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          <time>{date}</time>
          {news.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-200"
            >
              {cat.name}
            </Link>
          ))}
          {news.neighborhood && <span>{news.neighborhood.name}</span>}
          <span>بازدید: {toPersianDigits(news.viewCount + 1)}</span>
        </div>
      </header>
      {news.videoUrl && (
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={news.videoUrl}
            controls
            className="w-full h-full"
            poster={news.imageUrl || undefined}
          />
        </div>
      )}
      {!news.videoUrl && news.imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 bg-gray-200">
          <NewsImage
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}
      {news.summary && (
        <p className="text-lg text-gray-700 font-medium mb-6 leading-relaxed">{news.summary}</p>
      )}
      <div
        className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
        dir="rtl"
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />
    </article>
  );
}
