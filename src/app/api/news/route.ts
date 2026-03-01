import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .toLowerCase();
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, neighborhood: true },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      title,
      summary,
      body: bodyText,
      imageUrl,
      categoryId,
      neighborhoodId,
      published,
      featured,
    } = body;
    if (!title || !bodyText || !categoryId) {
      return NextResponse.json(
        { error: 'عنوان، متن و دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }
    let slug = slugify(title);
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    const news = await prisma.news.create({
      data: {
        title,
        slug,
        summary: summary ?? null,
        body: bodyText,
        imageUrl: imageUrl ?? null,
        categoryId,
        neighborhoodId: neighborhoodId || null,
        published: Boolean(published),
        featured: Boolean(featured),
      },
    });
    return NextResponse.json(news);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا در ایجاد خبر' }, { status: 500 });
  }
}
