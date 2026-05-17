'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { toPersianDigits } from '@/lib/persian';

export interface ShortItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  viewCount: number;
  neighborhood: string | null;
  videoSrc: string;
  poster: string | null;
}

export function ShortsFeed({ items }: { items: ShortItem[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const vids = Array.from(root.querySelectorAll('video'));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            v.play().catch(() => {
              /* مرورگر اجازهٔ پخش خودکار نداد؛ کاربر دستی پخش می‌کند */
            });
          } else {
            v.pause();
          }
        }
      },
      { root, threshold: [0, 0.6, 1] }
    );
    vids.forEach((v) => obs.observe(v));
    return () => obs.disconnect();
  }, [items]);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="h-[80vh] overflow-y-auto snap-y snap-mandatory rounded-lg bg-black"
    >
      {items.map((it) => (
        <section
          key={it.id}
          className="snap-start h-[80vh] relative flex items-center justify-center"
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={it.videoSrc}
            poster={it.poster ?? undefined}
            className="max-h-full max-w-full w-auto h-full object-contain"
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h2 className="font-bold text-base line-clamp-2">{it.title}</h2>
            {it.summary && (
              <p className="mt-1 text-sm text-white/80 line-clamp-2">{it.summary}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
              {it.neighborhood && <span>{it.neighborhood}</span>}
              <span>{toPersianDigits(it.viewCount)} بازدید</span>
            </div>
            <Link
              href={`/news/${it.slug}`}
              className="inline-block mt-3 bg-white text-gray-900 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-100"
            >
              مشاهده خبر کامل
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
