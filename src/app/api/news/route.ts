import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAdmin, requireEditorOrAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';

function slugify(text: string): string {
  return text
    .trim()
    .replace(/[\s،؟؛]+/g, '-') // فاصله و علائم نگارشی فارسی به خط تیره
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-') // چند خط تیره پشت‌سرهم به یکی
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const where =
    session.type === 'user' && session.role === 'REPORTER' && session.neighborhoodId
      ? { neighborhoodId: session.neighborhoodId }
      : {};
  const list = await prisma.news.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { categories: true, neighborhood: true },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    let {
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
    const reporterNeighborhoodId = session.type === 'user' ? session.neighborhoodId : null;
    const isReporter = session.type === 'user' && session.role === 'REPORTER';
    if (isReporter) {
      neighborhoodId = reporterNeighborhoodId ?? null;
      featured = false;
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
        createdById: session.type === 'user' ? session.id : null,
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
