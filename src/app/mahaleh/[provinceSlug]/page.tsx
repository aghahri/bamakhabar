import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProvinces, getCitiesByProvince } from '@/lib/locations';

type Props = { params: Promise<{ provinceSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { provinceSlug } = await params;
  const provinces = await getProvinces();
  const province = provinces.find((p) => p.slug === provinceSlug);
  if (!province) return { title: 'استان' };
  return { title: `${province.name} | اخبار محلات | باماخبر` };
}

export const revalidate = 60;

export default async function ProvincePage({ params }: Props) {
  const { provinceSlug } = await params;
  const [provinces, cities] = await Promise.all([
    getProvinces(),
    getCitiesByProvince(provinceSlug),
  ]);
  const province = provinces.find((p) => p.slug === provinceSlug);
  if (!province) notFound();

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        <span className="mx-2">/</span>
        <Link href="/mahaleh" className="hover:text-[var(--bama-primary)]">محلات</Link>
        <span className="mx-2">/</span>
        <span>{province.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3 mb-6">
        شهرستان‌های {province.name}
      </h1>
      <p className="text-gray-600 mb-6">شهرستان مورد نظر را انتخاب کنید.</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cities.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/mahaleh/${provinceSlug}/${c.slug}`}
              className="block p-4 bg-white rounded-lg border border-gray-100 hover:border-[var(--bama-primary)] hover:shadow-md transition-all"
            >
              <span className="font-medium text-gray-900">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {cities.length === 0 && (
        <p className="text-gray-500 py-8">شهرستانی در این استان ثبت نشده است.</p>
      )}
    </div>
  );
}
