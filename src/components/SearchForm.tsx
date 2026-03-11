'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type Province = { name: string; slug: string };
type City = { name: string; slug: string };

interface SearchFormProps {
  initialQ: string;
  initialProvinceSlug: string;
  initialCitySlug: string;
  provinces: Province[];
  cities: City[];
}

export function SearchForm({
  initialQ,
  initialProvinceSlug,
  initialCitySlug,
  provinces,
  cities: initialCities,
}: SearchFormProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [provinceSlug, setProvinceSlug] = useState(initialProvinceSlug);
  const [citySlug, setCitySlug] = useState(initialCitySlug);
  const [cities, setCities] = useState<City[]>(initialCities);

  useEffect(() => {
    setQ(initialQ);
    setProvinceSlug(initialProvinceSlug);
    setCitySlug(initialCitySlug);
    setCities(initialCities);
  }, [initialQ, initialProvinceSlug, initialCitySlug, initialCities]);

  useEffect(() => {
    if (!provinceSlug) {
      setCities([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/cities?province=${encodeURIComponent(provinceSlug)}`)
      .then((r) => r.json())
      .then((list: City[]) => {
        if (!cancelled) setCities(list);
      });
    return () => {
      cancelled = true;
    };
  }, [provinceSlug]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (provinceSlug) params.set('province', provinceSlug);
      if (citySlug) params.set('city', citySlug);
      router.push(`/search?${params.toString()}`);
    },
    [q, provinceSlug, citySlug, router]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="جستجو در عنوان و متن خبر..."
        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--bama-primary)] focus:border-transparent"
        aria-label="عبارت جستجو"
      />
      <select
        value={provinceSlug}
        onChange={(e) => {
          setProvinceSlug(e.target.value);
          setCitySlug('');
        }}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        aria-label="استان"
      >
        <option value="">همه استان‌ها</option>
        {provinces.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        value={citySlug}
        onChange={(e) => setCitySlug(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        aria-label="شهر"
        disabled={!provinceSlug}
      >
        <option value="">همه شهرها</option>
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-6 py-2 bg-[var(--bama-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        جستجو
      </button>
    </form>
  );
}
