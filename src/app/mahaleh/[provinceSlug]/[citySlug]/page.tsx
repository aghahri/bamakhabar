import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProvinceBySlug, getCityBySlug, getNeighborhoodsByCity } from '@/lib/locations';

type Props = { params: Promise<{ provinceSlug: string; citySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { provinceSlug, citySlug } = await params;
  const province = await getProvinceBySlug(provinceSlug);
  const city = await getCityBySlug(provinceSlug, citySlug);
  if (!province || !city) return { title: 'محلات' };
  return { title: `${city.name}، ${province.name} | اخبار محلات | باماخبر` };
}

export const revalidate = 60;

export default async function CityPage({ params }: Props) {
  const { provinceSlug, citySlug } = await params;
  const [province, city] = await Promise.all([
    getProvinceBySlug(provinceSlug),
    getCityBySlug(provinceSlug, citySlug),
  ]);
  if (!province || !city) notFound();
  const canonicalProvinceSlug = province.slug;
  const canonicalCitySlug = city.slug;
  const neighborhoods = await getNeighborhoodsByCity(canonicalProvinceSlug, canonicalCitySlug);

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        <span className="mx-2">/</span>
        <Link href="/mahaleh" className="hover:text-[var(--bama-primary)]">محلات</Link>
        <span className="mx-2">/</span>
        <Link href={`/mahaleh/${canonicalProvinceSlug}`} className="hover:text-[var(--bama-primary)]">{province.name}</Link>
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
              href={`/mahaleh/${canonicalProvinceSlug}/${canonicalCitySlug}/${n.slug}`}
              className="block p-4 bg-white rounded-lg border border-gray-100 hover:border-[var(--bama-primary)] hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{n.name}</span>
                {n.statusColor && (
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      n.statusColor === 'green' ? 'bg-green-500' : n.statusColor === 'red' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    title={n.statusColor === 'green' ? 'وضعیت مطلوب' : n.statusColor === 'red' ? 'نیاز به توجه' : 'متوسط'}
                  />
                )}
              </div>
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
