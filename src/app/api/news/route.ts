import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .toLowerCase();
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true, neighborhood: true },
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
      videoUrl,
      categoryIds,
      neighborhoodId,
      published,
      featured,
    } = body;
    if (!title || !bodyText || !categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'عنوان، متن و حداقل یک دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }
    let slug = slugify(title);
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    const sanitizedBody = sanitizeHtml(bodyText);
    const news = await prisma.news.create({
      data: {
        title,
        slug,
        summary: summary ?? null,
        body: sanitizedBody,
        imageUrl: imageUrl ?? null,
        videoUrl: videoUrl ?? null,
        categories: {
          connect: (categoryIds as string[]).map((id: string) => ({ id })),
        },
        neighborhoodId: neighborhoodId || null,
        published: Boolean(published),
        featured: Boolean(featured),
      },
      include: { categories: true },
    });
    return NextResponse.json(news);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا در ایجاد خبر' }, { status: 500 });
  }
}
