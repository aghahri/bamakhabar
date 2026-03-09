'use client';

import { useState, useEffect } from 'react';

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

type MapItem = { map_id: string; map_name: string; view_url: string };

function findMapForCity(maps: MapItem[], cityName: string): MapItem | null {
  const cityNorm = normalize(cityName);
  if (!cityNorm) return null;
  const exact = maps.find((m) => normalize(m.map_name) === cityNorm);
  if (exact) return exact;
  const includes = maps.find(
    (m) => normalize(m.map_name).includes(cityNorm) || cityNorm.includes(normalize(m.map_name))
  );
  return includes ?? maps.find((m) => normalize(m.map_name).startsWith(cityNorm)) ?? null;
}

const BASE_URL = process.env.NEXT_PUBLIC_IRANREGIONS_URL || 'https://iranregions.com';

export function CityIranRegionsMap({ cityName }: { cityName: string }) {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/iranregions-summary');
        const data = await res.json();
        if (cancelled) return;
        const maps: MapItem[] = data?.maps ?? [];
        const matched = findMapForCity(maps, cityName);
        const base = BASE_URL.replace(/\/$/, '');
        setIframeSrc(matched ? `${base}/?map_id=${encodeURIComponent(matched.map_id)}` : base);
      } catch {
        if (!cancelled) setIframeSrc(BASE_URL.replace(/\/$/, ''));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cityName]);

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
          نقشه محلات {cityName} (ایران‌ریجنز)
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          روی محله در نقشه کلیک کنید تا لینک گروه و اطلاعات همان محله در ایران‌ریجنز باز شود.
        </p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 h-[320px] flex items-center justify-center">
          <p className="text-gray-500">در حال بارگذاری نقشه...</p>
        </div>
      </section>
    );
  }

  const src = iframeSrc ?? BASE_URL.replace(/\/$/, '');

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
        نقشه محلات {cityName} (ایران‌ریجنز)
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        روی محله در نقشه کلیک کنید تا لینک گروه و اطلاعات همان محله در ایران‌ریجنز باز شود.
      </p>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
        <iframe
          src={src}
          title={`نقشه محلات ${cityName} - ایران‌ریجنز`}
          className="w-full h-[560px] min-h-[400px] border-0"
          allow="fullscreen"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        در صورت عدم نمایش،{' '}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--bama-primary)] hover:underline"
        >
          نقشه را در پنجره جدید
        </a>
        {' '}باز کنید.
      </p>
    </section>
  );
}
