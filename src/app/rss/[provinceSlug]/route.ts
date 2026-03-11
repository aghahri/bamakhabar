import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProvinceBySlug } from '@/lib/locations';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://bamakhabar.com';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provinceSlug: string }> }
) {
  const { provinceSlug } = await params;
  const province = await getProvinceBySlug(provinceSlug);
  if (!province) {
    return new NextResponse('استان یافت نشد', { status: 404 });
  }

  const news = await prisma.news.findMany({
    where: {
      published: true,
      neighborhood: { provinceSlug: province.slug },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { title: true, slug: true, summary: true, createdAt: true },
  });

  const items = news
    .map(
      (n) =>
        `  <item>
    <title>${escapeXml(n.title)}</title>
    <link>${BASE}/news/${encodeURIComponent(n.slug)}</link>
    <description>${escapeXml(n.summary || n.title)}</description>
    <pubDate>${new Date(n.createdAt).toUTCString()}</pubDate>
    <guid isPermaLink="true">${BASE}/news/${encodeURIComponent(n.slug)}</guid>
  </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>باماخبر | اخبار ${escapeXml(province.name)}</title>
    <link>${BASE}/mahaleh/${encodeURIComponent(province.slug)}</link>
    <description>اخبار محلات استان ${escapeXml(province.name)}</description>
    <language>fa-IR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/rss/${encodeURIComponent(province.slug)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
