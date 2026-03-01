import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, neighborhood: true },
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">عنوان</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">دسته</th>
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
                <td className="px-4 py-3 text-sm text-gray-600">{n.category.name}</td>
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
                    <span className="mr-1 px-2 py-1 text-xs rounded bg-amber-100 text-amber-800">شاخص</span>
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
        {news.length === 0 && (
          <p className="text-center text-gray-500 py-8">خبری ثبت نشده است.</p>
        )}
      </div>
    </div>
  );
}
