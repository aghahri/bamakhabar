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
          <div className="container-custom py-3 flex items-center justify-between">
            <Link href="/admin" className="font-bold text-lg">
              پنل ادمین باماخبر
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm hover:underline" target="_blank">
                مشاهده سایت
              </Link>
              <Link href="/admin/news/new" className="text-sm hover:underline">
                خبر جدید
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
