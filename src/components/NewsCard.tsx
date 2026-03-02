import Link from 'next/link';
import { NewsImage } from './NewsImage';

interface NewsCardProps {
  title: string;
  slug: string;
  summary: string | null;
  imageUrl: string | null;
  categoryName: string;
  createdAt: Date;
  featured?: boolean;
}

export function NewsCard({
  title,
  slug,
  summary,
  imageUrl,
  categoryName,
  createdAt,
  featured = false,
}: NewsCardProps) {
  const date = new Date(createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (featured) {
    return (
      <Link href={`/news/${slug}`} className="news-card block group">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full min-h-[280px] bg-gray-200">
            {imageUrl ? (
              <NewsImage
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">📰</div>
            )}
            <span className="absolute top-3 right-3 bg-[var(--bama-primary)] text-white text-xs px-2 py-1 rounded">
              {categoryName}
            </span>
          </div>
          <div className="p-6 flex flex-col justify-center">
            <time className="text-sm text-gray-500 mb-2">{date}</time>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-[var(--bama-primary)] transition-colors line-clamp-2">
              {title}
            </h2>
            {summary && (
              <p className="mt-2 text-gray-600 text-sm line-clamp-2">{summary}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${slug}`} className="news-card block group">
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <NewsImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-3xl">📰</div>
        )}
        <span className="absolute top-2 right-2 bg-[var(--bama-primary)] text-white text-xs px-2 py-0.5 rounded">
          {categoryName}
        </span>
      </div>
      <div className="p-4">
        <time className="text-xs text-gray-500">{date}</time>
        <h2 className="mt-1 font-bold text-gray-900 group-hover:text-[var(--bama-primary)] transition-colors line-clamp-2">
          {title}
        </h2>
        {summary && (
          <p className="mt-1 text-gray-600 text-sm line-clamp-2">{summary}</p>
        )}
      </div>
    </Link>
  );
}
