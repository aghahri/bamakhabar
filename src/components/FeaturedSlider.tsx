'use client';

import { useEffect, useState } from 'react';
import { NewsCard } from './NewsCard';

interface FeaturedItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  imageUrl: string | null;
  categoryNames: string[];
  createdAt: Date | string;
}

interface FeaturedSliderProps {
  items: FeaturedItem[];
}

export function FeaturedSlider({ items }: FeaturedSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[index];

  function go(next: number) {
    if (!items.length) return;
    const len = items.length;
    setIndex(((next % len) + len) % len);
  }

  return (
    <div className="relative">
      <NewsCard
        title={current.title}
        slug={current.slug}
        summary={current.summary}
        imageUrl={current.imageUrl}
        categoryNames={current.categoryNames}
        createdAt={new Date(current.createdAt)}
        featured
      />
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="hidden md:flex absolute inset-y-0 right-0 items-center pr-3 text-white/80 hover:text-white"
            aria-label="خبر قبلی"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="hidden md:flex absolute inset-y-0 left-0 items-center pl-3 text-white/80 hover:text-white"
            aria-label="خبر بعدی"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full border border-white/70 ${
                  i === index ? 'bg-white' : 'bg-white/20'
                }`}
                aria-label={`رفتن به خبر ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

