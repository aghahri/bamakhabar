import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const where =
    session.type === 'user' && session.role === 'REPORTER' && session.neighborhoodId
      ? { neighborhoodId: session.neighborhoodId }
      : {};
  const news = await prisma.news.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { categories: true, neighborhood: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت اخبار</h1>
      <Link
        href="/admin/news/new"
        className="btn-primary inline-block mb-6"
      >
        افزودن خبر جدید
      </Link>
      {/* Mobile: card layout */}
      <div className="md:hidden space-y-3">
        {news.map((n) => (
          <div key={n.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{n.title}</h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {n.categories.map((c) => (
                <span key={c.id} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                  {c.name}
                </span>
              ))}
              {n.neighborhood && <span className="text-xs text-gray-500">· {n.neighborhood.name}</span>}
              <span className="text-xs text-gray-400">· {new Date(n.createdAt).toLocaleDateString('fa-IR')}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  n.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {n.published ? 'منتشر شده' : 'پیش‌نویس'}
              </span>
              {n.featured && (
                <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800">
                  در اسلایدر
                </span>
              )}
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
              <Link href={`/admin/news/${n.id}`} className="text-[var(--bama-primary)] hover:underline">
                ویرایش
              </Link>
              <Link href={`/news/${n.slug}`} target="_blank" className="text-blue-600 hover:underline">
                مشاهده
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">عنوان</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">دسته‌ها</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">محله</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{n.title}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {n.categories.map((c) => (
                      <span key={c.id} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{n.neighborhood?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      n.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {n.published ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                  {n.featured && (
                    <span className="mr-1 px-2 py-1 text-xs rounded bg-amber-100 text-amber-800">
                      در اسلایدر
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(n.createdAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/admin/news/${n.id}`}
                    className="text-[var(--bama-primary)] hover:underline"
                  >
                    ویرایش
                  </Link>
                  {' · '}
                  <Link
                    href={`/news/${n.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    مشاهده
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {news.length === 0 && (
        <p className="text-center text-gray-500 py-8">خبری ثبت نشده است.</p>
      )}
    </div>
  );
}
