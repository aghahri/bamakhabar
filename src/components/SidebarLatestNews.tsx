import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { toPersianDigits } from '@/lib/persian';

export async function SidebarLatestNews() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { categories: true },
  });

  if (news.length === 0) return null;

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sticky top-24">
        <h3 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-2 mb-3">
          آخرین اخبار
        </h3>
        <ul className="space-y-3">
          {news.map((n) => (
            <li key={n.id}>
              <Link
                href={`/news/${n.slug}`}
                className="block text-sm text-gray-700 hover:text-[var(--bama-primary)] transition-colors line-clamp-2"
              >
                {n.title}
              </Link>
              <span className="text-xs text-gray-400 mt-0.5 block">
                {n.categories.map((c) => c.name).join('، ')} · {toPersianDigits(new Date(n.createdAt).toLocaleDateString('fa-IR'))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
