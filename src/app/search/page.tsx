import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NewsCard } from '@/components/NewsCard';
import { getProvinces, getCitiesByProvince, getProvinceBySlug, getCityBySlug } from '@/lib/locations';
import { SearchForm } from '@/components/SearchForm';

export const revalidate = 60;

type Props = { searchParams: Promise<{ q?: string; province?: string; city?: string }> };

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  const title = q ? `جستجو: ${q} | باماخبر` : 'جستجوی اخبار | باماخبر';
  return { title };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, province: provinceSlug, city: citySlug } = await searchParams;
  const provinces = await getProvinces();
  let cities: { name: string; slug: string }[] = [];
  let canonicalProvinceSlug: string | null = null;
  let canonicalCitySlug: string | null = null;
  if (provinceSlug) {
    const province = await getProvinceBySlug(provinceSlug);
    if (province) {
      canonicalProvinceSlug = province.slug;
      cities = await getCitiesByProvince(province.slug);
    }
  }
  if (citySlug && canonicalProvinceSlug) {
    const city = await getCityBySlug(canonicalProvinceSlug, citySlug);
    if (city) canonicalCitySlug = city.slug;
  }

  const where: Parameters<typeof prisma.news.findMany>[0]['where'] = {
    published: true,
  };
  if (q?.trim()) {
    const term = q.trim();
    where.AND = [
      {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { summary: { contains: term, mode: 'insensitive' } },
          { body: { contains: term, mode: 'insensitive' } },
        ],
      },
    ];
  }
  if (canonicalProvinceSlug || canonicalCitySlug) {
    where.neighborhood = {};
    if (canonicalProvinceSlug) where.neighborhood.provinceSlug = canonicalProvinceSlug;
    if (canonicalCitySlug) where.neighborhood.citySlug = canonicalCitySlug;
  }

  const news = await prisma.news.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { categories: true, neighborhood: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3 mb-4">
        جستجوی اخبار
      </h1>
      <SearchForm
        initialQ={q ?? ''}
        initialProvinceSlug={provinceSlug ?? ''}
        initialCitySlug={citySlug ?? ''}
        provinces={provinces}
        cities={cities}
      />
      {q?.trim() || provinceSlug || citySlug ? (
        <p className="text-sm text-gray-600 mt-4 mb-4">
          {news.length} خبر یافت شد.
        </p>
      ) : null}
      {news.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          {q?.trim() || provinceSlug || citySlug
            ? 'نتیجه‌ای یافت نشد. عبارت جستجو یا فیلتر منطقه را تغییر دهید.'
            : 'عبارت جستجو را وارد کنید یا منطقه را انتخاب کنید.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {news.map((n) => (
            <NewsCard
              key={n.id}
              title={n.title}
              slug={n.slug}
              summary={n.summary}
              imageUrl={n.imageUrl}
              categoryNames={n.categories.map((c) => c.name)}
              createdAt={n.createdAt}
              regionLabel={n.neighborhood ? `${n.neighborhood.name}، ${n.neighborhood.city ?? ''}` : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
