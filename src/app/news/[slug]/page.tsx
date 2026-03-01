import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

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
    include: { category: true, neighborhood: true },
  });
  if (!news) notFound();

  await prisma.news.update({
    where: { id: news.id },
    data: { viewCount: { increment: 1 } },
  });

  const date = new Date(news.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="container-custom py-6 max-w-4xl">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${news.category.slug}`} className="hover:text-[var(--bama-primary)]">
          {news.category.name}
        </Link>
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
          <span>{news.category.name}</span>
          {news.neighborhood && <span>{news.neighborhood.name}</span>}
          <span>بازدید: {news.viewCount + 1}</span>
        </div>
      </header>
      {news.imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 bg-gray-200">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}
      {news.summary && (
        <p className="text-lg text-gray-700 font-medium mb-6 leading-relaxed">{news.summary}</p>
      )}
      <div
        className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: news.body.replace(/\n/g, '<br />') }}
      />
    </article>
  );
}
