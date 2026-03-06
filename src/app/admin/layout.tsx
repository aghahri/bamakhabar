import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {session && (
        <header className="bg-[var(--bama-dark)] text-white shadow">
          <div className="container-custom py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <Link href="/admin" className="font-bold text-lg">
              پنل ادمین باماخبر
            </Link>
            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <Link href="/" className="hover:underline" target="_blank">
                مشاهده سایت
              </Link>
              <Link href="/admin/news/new" className="hover:underline">
                خبر جدید
              </Link>
              <Link href="/admin/categories" className="hover:underline">
                دسته‌بندی‌ها
              </Link>
              <Link href="/admin/neighborhoods" className="hover:underline">
                محلات
              </Link>
              <Link href="/admin/change-password" className="hover:underline">
                تغییر رمز
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      <main className="container-custom py-6">{children}</main>
    </div>
  );
}
