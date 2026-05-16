'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NewsCard } from './NewsCard';

export interface ListNewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  imageUrl: string | null;
  categoryNames: string[];
  createdAt: string;
  regionLabel: string | null;
}

interface Props {
  initialItems: ListNewsItem[];
  initialHasMore: boolean;
  initialNextSkip: number;
}

export function HomeNewsList({ initialItems, initialHasMore, initialNextSkip }: Props) {
  const [items, setItems] = useState<ListNewsItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const skipRef = useRef(initialNextSkip);
  const seenRef = useRef<Set<string>>(new Set(initialItems.map((n) => n.id)));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/news/public?skip=${skipRef.current}&take=12`);
      if (!res.ok) throw new Error('bad response');
      const data: { items: ListNewsItem[]; hasMore: boolean; nextSkip: number } =
        await res.json();
      const fresh = data.items.filter((n) => !seenRef.current.has(n.id));
      fresh.forEach((n) => seenRef.current.add(n.id));
      skipRef.current = data.nextSkip;
      setItems((prev) => [...prev, ...fresh]);
      setHasMore(data.hasMore);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '400px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((news) => (
          <NewsCard
            key={news.id}
            title={news.title}
            slug={news.slug}
            summary={news.summary}
            imageUrl={news.imageUrl}
            categoryNames={news.categoryNames}
            createdAt={new Date(news.createdAt)}
            regionLabel={news.regionLabel}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-500 py-8">خبری منتشر نشده است.</p>
      )}

      <div ref={sentinelRef} className="h-px" aria-hidden />

      <div className="py-6 text-center text-sm">
        {loading && <span className="text-gray-500">در حال بارگذاری اخبار بیشتر…</span>}
        {!loading && error && (
          <button
            type="button"
            onClick={loadMore}
            className="text-[var(--bama-primary)] hover:underline"
          >
            خطا در بارگذاری. تلاش دوباره
          </button>
        )}
        {!loading && !error && !hasMore && items.length > 0 && (
          <span className="text-gray-400">به انتهای اخبار رسیدید</span>
        )}
      </div>
    </div>
  );
}
