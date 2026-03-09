'use client';

import { useState, useEffect } from 'react';

function normalize(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/ي/g, 'ی') // عربی به فارسی
    .replace(/ك/g, 'ک')
    .trim();
}

/** از نام نقشه پیشوند «منطقه N» را برمی‌دارد تا با نام شهر تطبیق دهیم، مثلاً «منطقه ۳ تهران» → «تهران» */
function extractCityFromMapName(mapName: string): string {
  const n = normalize(mapName);
  const withoutRegion = n.replace(/^منطقه\s*[\d۰-۹0-9]+\s*/i, '').trim();
  return withoutRegion || n;
}

type MapItem = { map_id: string; map_name: string; view_url: string };

function findMapForCity(maps: MapItem[], cityName: string): MapItem | null {
  let cityNorm = normalize(cityName);
  if (!cityNorm || !maps.length) return null;
  // حذف پیشوندهای رایج تا «تهران» با «شهرستان تهران» یا «شهر تهران» هم بخورد
  cityNorm = cityNorm.replace(/^(شهرستان|شهر)\s+/i, '').trim() || cityNorm;

  const norm = (m: MapItem) => normalize(m.map_name);
  const cityPart = (m: MapItem) => extractCityFromMapName(m.map_name);

  // تطابق دقیق با نام نقشه یا با بخش شهر (بعد از حذف «منطقه N»)
  let match = maps.find((m) => norm(m) === cityNorm || cityPart(m) === cityNorm);
  if (match) return match;

  // نام نقشه یا بخش شهر شامل نام شهر باشد (یا برعکس)
  match = maps.find(
    (m) =>
      norm(m).includes(cityNorm) ||
      cityNorm.includes(norm(m)) ||
      cityPart(m).includes(cityNorm) ||
      cityNorm.includes(cityPart(m))
  );
  if (match) return match;

  // نام نقشه به نام شهر ختم شود، مثلاً «محلات تهران»
  match = maps.find((m) => norm(m).endsWith(cityNorm) || cityPart(m).endsWith(cityNorm));
  if (match) return match;

  match = maps.find((m) => norm(m).startsWith(cityNorm) || cityPart(m).startsWith(cityNorm));
  return match ?? null;
}

const BASE_URL = process.env.NEXT_PUBLIC_IRANREGIONS_URL || 'https://iranregions.com';

export function CityIranRegionsMap({ cityName }: { cityName: string }) {
  /** فقط وقتی نقشهٔ این شهر از API پیدا شد iframe را با همان map_id نشان می‌دهیم؛ صفحهٔ اول ایران‌ریجنز لود نمی‌شود. */
  const [mapId, setMapId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** true = API جواب داد و لیست نقشه داشت، false = API خطا یا خالی */
  const [apiHasMaps, setApiHasMaps] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMapId(null);
      setApiHasMaps(false);
      try {
        // درخواست مستقیم به ایران‌ریجنز (با CORS) تا از مشکل دسترسی سرور باماخبر به ایران‌ریجنز جلوگیری شود
        const apiUrl = `${BASE_URL.replace(/\/$/, '')}/api/public/summary`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (cancelled) return;
        const maps: MapItem[] = data?.maps ?? [];
        setApiHasMaps(maps.length > 0);
        const matched = findMapForCity(maps, cityName);
        if (matched) setMapId(matched.map_id);
      } catch {
        // بدون map_id اگرrame نشان داده نمی‌شود
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
        <div className="rounded-lg border border-gray-200 bg-gray-50 h-[320px] flex items-center justify-center">
          <p className="text-gray-500">در حال بارگذاری نقشه...</p>
        </div>
      </section>
    );
  }

  if (!mapId) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
          نقشه محلات {cityName} (ایران‌ریجنز)
        </h2>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-600 mb-3">
            {apiHasMaps
              ? `نقشه «${cityName}» در لیست نقشه‌های ایران‌ریجنز یافت نشد. نام نقشه در ایران‌ریجنز باید با نام شهر هم‌خوانی داشته باشد (مثلاً تهران، منطقه ۳ تهران).`
              : 'در حال حاضر نقشه‌ای از ایران‌ریجنز بارگذاری نشده یا سرویس در دسترس نیست.'}
          </p>
          <a
            href={BASE_URL.replace(/\/$/, '')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--bama-primary)] hover:underline"
          >
            مشاهده همه نقشه‌ها در ایران‌ریجنز
          </a>
        </div>
      </section>
    );
  }

  const iframeSrc = `${BASE_URL.replace(/\/$/, '')}/?map_id=${encodeURIComponent(mapId)}`;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
        نقشه محلات {cityName} (ایران‌ریجنز)
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        نقشه فقط همین شهر — روی محله کلیک کنید تا لینک گروه و اطلاعات در ایران‌ریجنز باز شود.
      </p>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
        <iframe
          src={iframeSrc}
          title={`نقشه محلات ${cityName} - ایران‌ریجنز`}
          className="w-full h-[560px] min-h-[400px] border-0"
          allow="fullscreen"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        در صورت عدم نمایش،{' '}
        <a
          href={iframeSrc}
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
