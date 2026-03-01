import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProvinces, getCitiesByProvince, getNeighborhoodsByCity } from '@/lib/locations';

type Props = { params: Promise<{ provinceSlug: string; citySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { provinceSlug, citySlug } = await params;
  const provinces = await getProvinces();
  const cities = await getCitiesByProvince(provinceSlug);
  const province = provinces.find((p) => p.slug === provinceSlug);
  const city = cities.find((c) => c.slug === citySlug);
  if (!province || !city) return { title: 'محلات' };
  return { title: `${city.name}، ${province.name} | اخبار محلات | باماخبر` };
}

export const revalidate = 60;

export default async function CityPage({ params }: Props) {
  const { provinceSlug, citySlug } = await params;
  const [provinces, cities, neighborhoods] = await Promise.all([
    getProvinces(),
    getCitiesByProvince(provinceSlug),
    getNeighborhoodsByCity(provinceSlug, citySlug),
  ]);
  const province = provinces.find((p) => p.slug === provinceSlug);
  const city = cities.find((c) => c.slug === citySlug);
  if (!province || !city) notFound();

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        <span className="mx-2">/</span>
        <Link href="/mahaleh" className="hover:text-[var(--bama-primary)]">محلات</Link>
        <span className="mx-2">/</span>
        <Link href={`/mahaleh/${provinceSlug}`} className="hover:text-[var(--bama-primary)]">{province.name}</Link>
        <span className="mx-2">/</span>
        <span>{city.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3 mb-6">
        محلات {city.name}
      </h1>
      <p className="text-gray-600 mb-6">محله مورد نظر را انتخاب کنید تا اخبار آن را ببینید.</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {neighborhoods.map((n) => (
          <li key={n.id}>
            <Link
              href={`/mahaleh/${provinceSlug}/${citySlug}/${n.slug}`}
              className="block p-4 bg-white rounded-lg border border-gray-100 hover:border-[var(--bama-primary)] hover:shadow-md transition-all"
            >
              <span className="font-medium text-gray-900">{n.name}</span>
              {n.newsCount > 0 && (
                <span className="block text-sm text-gray-500 mt-1">{n.newsCount} خبر</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {neighborhoods.length === 0 && (
        <p className="text-gray-500 py-8">محله‌ای در این شهرستان ثبت نشده است.</p>
      )}
    </div>
  );
}
