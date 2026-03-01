import { prisma } from '@/lib/prisma';
import { MobileNav } from './MobileNav';
import Link from 'next/link';

export async function Header() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    take: 8,
  });

  const links = [
    { href: '/', label: 'صفحه اصلی' },
    { href: '/mahaleh', label: 'اخبار محلات' },
    ...categories.map((cat) => ({ href: `/category/${cat.slug}`, label: cat.name })),
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[var(--bama-primary)]">باماخبر</span>
            <span className="text-sm text-gray-500 hidden sm:inline">| اخبار محلات کشور</span>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 hover:text-[var(--bama-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {/* Mobile nav */}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
