'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toPersianDigits } from '@/lib/persian';

type IranRegionsSummaryResponse = {
  success: boolean;
  maps: { map_id: string; map_name: string; feature_count: number; view_url: string }[];
  total_maps: number;
  total_features: number;
  error?: string;
};

const IRANREGIONS_SITE = process.env.NEXT_PUBLIC_IRANREGIONS_URL || 'https://iranregions.com';

export function IranRegionsGateway() {
  const [data, setData] = useState<IranRegionsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const res = await fetch('/api/iranregions-summary');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ success: false, maps: [], total_maps: 0, total_features: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-2 mb-3">
          نقشه و اطلاعات محلات
        </h3>
        <p className="text-sm text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  const ok = data?.success && data.maps && data.maps.length >= 0;
  const totalMaps = data?.total_maps ?? 0;
  const totalFeatures = data?.total_features ?? 0;
  const maps = data?.maps ?? [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-2 mb-3">
        نقشه و اطلاعات محلات
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        مشاهده نقشه‌های محلات و لینک گروه‌های محلی از ایران‌ریجنز.
      </p>
      {ok ? (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {toPersianDigits(String(totalMaps))} نقشه · {toPersianDigits(String(totalFeatures))} محله
          </p>
          {maps.length > 0 && (
            <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {maps.slice(0, 6).map((m) => (
                <li key={m.map_id}>
                  <a
                    href={m.view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-gray-700 hover:text-[var(--bama-primary)] transition-colors line-clamp-1"
                  >
                    {m.map_name}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={IRANREGIONS_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center py-2 px-3 text-sm font-medium rounded-lg bg-[var(--bama-primary)] text-white hover:opacity-90 transition-opacity"
          >
            ورود به نقشه محلات
          </Link>
        </>
      ) : (
        <Link
          href={IRANREGIONS_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full text-center py-2 px-3 text-sm font-medium rounded-lg bg-[var(--bama-primary)] text-white hover:opacity-90 transition-opacity"
        >
          ورود به نقشه محلات
        </Link>
      )}
    </div>
  );
}
