import Link from 'next/link';
import type { NeighborhoodRanking as RankingType } from '@/lib/locations';

interface NeighborhoodRankingProps {
  ranking: RankingType;
}

function Block({
  title,
  items,
  colorClass,
  emptyMessage,
}: {
  title: string;
  items: RankingType['red'];
  colorClass: string;
  emptyMessage: string;
}) {
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClass}`}>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm opacity-80">{emptyMessage}</p>
      ) : (
        <ol className="list-decimal list-inside space-y-1.5">
          {items.map((n) => (
            <li key={n.id}>
              {n.provinceSlug && n.citySlug ? (
                <Link
                  href={`/mahaleh/${n.provinceSlug}/${n.citySlug}/${n.slug}`}
                  className="hover:underline font-medium"
                >
                  {n.name}
                </Link>
              ) : (
                <span className="font-medium">{n.name}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function NeighborhoodRanking({ ranking }: NeighborhoodRankingProps) {
  const hasAny = ranking.red.length > 0 || ranking.yellow.length > 0 || ranking.green.length > 0;
  if (!hasAny) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-3 mb-4">
        رنکینگ وضعیت محلات
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        محلاتی که وضعیت آن‌ها بر اساس اخبار اخیر محاسبه شده است (پنج محله پرخطر، پنج محله با وضعیت متوسط، پنج محله با وضعیت مطلوب).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Block
          title="۵ محله پرخطر (قرمز)"
          items={ranking.red}
          colorClass="bg-red-50 border-red-200 text-red-900"
          emptyMessage="در حال حاضر محله‌ای با وضعیت قرمز ثبت نشده است."
        />
        <Block
          title="۵ محله با وضعیت متوسط (زرد)"
          items={ranking.yellow}
          colorClass="bg-amber-50 border-amber-200 text-amber-900"
          emptyMessage="در حال حاضر محله‌ای با وضعیت زرد ثبت نشده است."
        />
        <Block
          title="۵ محله با وضعیت مطلوب (سبز)"
          items={ranking.green}
          colorClass="bg-green-50 border-green-200 text-green-900"
          emptyMessage="در حال حاضر محله‌ای با وضعیت سبز ثبت نشده است."
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        <Link href="/mahaleh" className="text-[var(--bama-primary)] hover:underline">
          مشاهده همه محلات
        </Link>
      </p>
    </section>
  );
}
