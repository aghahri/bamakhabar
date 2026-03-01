import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export async function Header() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    take: 8,
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--bama-primary)]">باماخبر</span>
            <span className="text-sm text-gray-500 hidden sm:inline">| اخبار محلات کشور</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[var(--bama-primary)] transition-colors"
            >
              صفحه اصلی
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 hover:text-[var(--bama-primary)] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mr-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              target="_blank"
            >
              ورود ادمین
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
