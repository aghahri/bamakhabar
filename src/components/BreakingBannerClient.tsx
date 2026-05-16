'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface BreakingItem {
  id: string;
  slug: string;
  title: string;
}

export function BreakingBannerClient({ items }: { items: BreakingItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[Math.min(index, items.length - 1)];

  return (
    <div dir="rtl" className="bg-[var(--bama-primary)] text-white">
      <div className="container-custom flex items-center gap-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 shrink-0 font-bold uppercase tracking-wide">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          خبر فوری
        </span>
        <span className="hidden sm:block h-4 w-px bg-white/40 shrink-0" />
        <Link
          key={current.id}
          href={`/news/${current.slug}`}
          className="min-w-0 flex-1 truncate hover:underline"
          title={current.title}
        >
          {current.title}
        </Link>
        {items.length > 1 && (
          <span className="shrink-0 text-xs text-white/80 tabular-nums">
            {index + 1}/{items.length}
          </span>
        )}
      </div>
    </div>
  );
}
