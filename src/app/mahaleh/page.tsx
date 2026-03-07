import Link from 'next/link';
import { getProvinces, getNeighborhoodRanking } from '@/lib/locations';
import { NeighborhoodRanking } from '@/components/NeighborhoodRanking';

export const metadata = {
  title: 'اخبار بر اساس استان | باماخبر',
  description: 'انتخاب استان و مشاهده اخبار محلات',
};

export const revalidate = 60;

export default async function MahalehPage() {
  const [provinces, ranking] = await Promise.all([getProvinces(), getNeighborhoodRanking()]);

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[var(--bama-primary)]">باماخبر</Link>
        <span className="mx-2">/</span>
        <span>اخبار محلات</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 border-r-4 border-[var(--bama-primary)] pr-3 mb-6">
        اخبار محلات کشور
      </h1>
      <NeighborhoodRanking ranking={ranking} />
      <p className="text-gray-600 mb-6">
        استان خود را انتخاب کنید تا شهرستان‌ها و سپس محلات را ببینید.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {provinces.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/mahaleh/${p.slug}`}
              className="block p-4 bg-white rounded-lg border border-gray-100 hover:border-[var(--bama-primary)] hover:shadow-md transition-all"
            >
              <span className="font-medium text-gray-900">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {provinces.length === 0 && (
        <p className="text-gray-500 py-8">هنوز استانی ثبت نشده است.</p>
      )}
    </div>
  );
}
