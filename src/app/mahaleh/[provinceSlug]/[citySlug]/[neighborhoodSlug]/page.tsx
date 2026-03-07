import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProvinces, getCitiesByProvince, getNeighborhoodBySlug } from '@/lib/locations';
import { NewsCard } from '@/components/NewsCard';

type Props = { params: Promise<{ provinceSlug: string; citySlug: string; neighborhoodSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { provinceSlug, citySlug, neighborhoodSlug } = await params;
  const neighborhood = await getNeighborhoodBySlug(provinceSlug, citySlug, neighborhoodSlug);
  if (!neighborhood) return { title: 'محله' };
  return {
    title: `اخبار محله ${neighborhood.name} | باماخبر`,
    description: `آخرین اخبار و رویدادهای محله ${neighborhood.name}`,
  };
}

export const revalidate = 60;

export default async function NeighborhoodNewsPage({ params }: Props) {
  const { provinceSlug, citySlug, neighborhoodSlug } = await params;
  const [provinces, cities, neighborhood] = await Promise.all([
    getProvinces(),
    getCitiesByProvince(provinceSlug),
    getNeighborhoodBySlug(provinceSlug, citySlug, neighborhoodSlug),
  ]);
  const province = provinces.find((p) => p.slug === provinceSlug);
  const city = cities.find((c) => c.slug === citySlug);
  if (!province || !city || !neighborhood) notFound();

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        <span className="mx-2">/</span>
        <Link href="/mahaleh" className="hover:text-[var(--bama-primary)]">محلات</Link>
        <span className="mx-2">/</span>
        <Link href={`/mahaleh/${provinceSlug}`} className="hover:text-[var(--bama-primary)]">{province.name}</Link>
        <span className="mx-2">/</span>
        <Link href={`/mahaleh/${provinceSlug}/${citySlug}`} className="hover:text-[var(--bama-primary)]">{city.name}</Link>
        <span className="mx-2">/</span>
        <span>{neighborhood.name}</span>
      </nav>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3">
          اخبار محله {neighborhood.name}
        </h1>
        {neighborhood.statusColor && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              neighborhood.statusColor === 'green'
                ? 'bg-green-100 text-green-800'
                : neighborhood.statusColor === 'red'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
            }`}
          >
            {neighborhood.statusColor === 'green' ? 'وضعیت مطلوب' : neighborhood.statusColor === 'red' ? 'نیاز به توجه' : 'وضعیت متوسط'}
          </span>
        )}
      </div>
      {neighborhood.news.length === 0 ? (
        <p className="text-gray-500 py-8">هنوز خبری برای این محله منتشر نشده است.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {neighborhood.news.map((n) => (
            <NewsCard
              key={n.id}
              title={n.title}
              slug={n.slug}
              summary={n.summary}
              imageUrl={n.imageUrl}
              categoryNames={n.categories.map((c) => c.name)}
              createdAt={n.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
