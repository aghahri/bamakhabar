import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProvinceBySlug, getCityBySlug, getNeighborhoodsByCity } from '@/lib/locations';

const IRANREGIONS_API = process.env.IRANREGIONS_API_URL || 'https://iranregions.com';
const IRANREGIONS_BASE = process.env.NEXT_PUBLIC_IRANREGIONS_URL || IRANREGIONS_API;

type IranRegionsMap = { map_id: string; map_name: string; view_url: string };

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

async function getIranRegionsMapForCity(cityName: string): Promise<IranRegionsMap | null> {
  try {
    const res = await fetch(`${IRANREGIONS_API}/api/public/summary`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const maps: IranRegionsMap[] = data?.maps ?? [];
    const cityNorm = normalize(cityName);
    if (!cityNorm) return null;
    // ترجیح: تطابق دقیق، سپس شامل نام شهر، سپس نام نقشه داخل نام شهر
    const exact = maps.find((m) => normalize(m.map_name) === cityNorm);
    if (exact) return exact;
    const includesCity = maps.find(
      (m) => normalize(m.map_name).includes(cityNorm) || cityNorm.includes(normalize(m.map_name))
    );
    return includesCity ?? maps.find((m) => normalize(m.map_name).startsWith(cityNorm)) ?? null;
  } catch {
    return null;
  }
}

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
  const [neighborhoods, iranRegionsMap] = await Promise.all([
    getNeighborhoodsByCity(canonicalProvinceSlug, canonicalCitySlug),
    getIranRegionsMapForCity(city.name),
  ]);

  const mapIframeSrc = iranRegionsMap
    ? `${IRANREGIONS_BASE.replace(/\/$/, '')}/?map_id=${encodeURIComponent(iranRegionsMap.map_id)}`
    : IRANREGIONS_BASE.replace(/\/$/, '');

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

      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-3">
          نقشه محلات {city.name} (ایران‌ریجنز)
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          روی محله در نقشه کلیک کنید تا لینک گروه و اطلاعات همان محله در ایران‌ریجنز باز شود.
        </p>
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <iframe
            src={mapIframeSrc}
            title={`نقشه محلات ${city.name} - ایران‌ریجنز`}
            className="w-full h-[560px] min-h-[400px] border-0"
            allow="fullscreen"
            loading="lazy"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          در صورت عدم نمایش،{' '}
          <a
            href={mapIframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--bama-primary)] hover:underline"
          >
            نقشه را در پنجره جدید
          </a>
          {' '}باز کنید.
        </p>
      </section>
    </div>
  );
}
