import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toPersianDigits } from '@/lib/persian';

export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const [totalNews, publishedNews, neighborhoodsWithCount, recentCount] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { published: true } }),
    prisma.neighborhood.findMany({
      where: { news: { some: {} } },
      include: { _count: { select: { news: true } } },
    }),
    prisma.news.count({
      where: {
        published: true,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const byNeighborhood = neighborhoodsWithCount
    .sort((a, b) => b._count.news - a._count.news)
    .slice(0, 30);
  const maxCount = byNeighborhood[0]?._count?.news ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">آمار سایت</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-r-4 border-[var(--bama-primary)]">
          <p className="text-sm text-gray-500">کل اخبار</p>
          <p className="text-2xl font-bold text-gray-900">{toPersianDigits(String(totalNews))}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-r-4 border-green-500">
          <p className="text-sm text-gray-500">اخبار منتشر شده</p>
          <p className="text-2xl font-bold text-gray-900">{toPersianDigits(String(publishedNews))}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-r-4 border-amber-500">
          <p className="text-sm text-gray-500">اخبار هفته گذشته</p>
          <p className="text-2xl font-bold text-gray-900">{toPersianDigits(String(recentCount))}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-r-4 border-blue-500">
          <p className="text-sm text-gray-500">محلات دارای خبر</p>
          <p className="text-2xl font-bold text-gray-900">{toPersianDigits(String(byNeighborhood.length))}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 font-bold text-gray-800">
          محلات بر اساس تعداد اخبار (۳۰ محله پرخبر)
        </h2>
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-right font-medium text-gray-500">محله</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">شهر</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">استان</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-24">تعداد خبر</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">نمودار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {byNeighborhood.map((n) => (
                <tr key={n.id}>
                  <td className="px-3 py-2 font-medium">{n.name}</td>
                  <td className="px-3 py-2 text-gray-600">{n.city ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{n.province ?? '—'}</td>
                  <td className="px-3 py-2">{toPersianDigits(String(n._count.news))}</td>
                  <td className="px-3 py-2">
                    <div
                      className="h-5 bg-[var(--bama-primary)] rounded min-w-[2rem]"
                      style={{
                        width: `${Math.max(10, (n._count.news / maxCount) * 100)}%`,
                      }}
                      title={`${n._count.news} خبر`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {byNeighborhood.length === 0 && (
          <p className="p-6 text-center text-gray-500">هنوز خبری به محله‌ای اختصاص داده نشده است.</p>
        )}
      </div>
    </div>
  );
}
