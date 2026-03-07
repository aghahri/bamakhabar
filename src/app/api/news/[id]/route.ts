import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireEditorOrAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id },
    include: { categories: true, neighborhood: true },
  });
  if (!news) return NextResponse.json({ error: 'خبر یافت نشد' }, { status: 404 });
  return NextResponse.json(news);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'خبر یافت نشد' }, { status: 404 });
  const isReporter = session.type === 'user' && session.role === 'REPORTER';
  if (isReporter && existing.neighborhoodId !== session.neighborhoodId) {
    return NextResponse.json({ error: 'فقط اخبار محله خود را می‌توانید ویرایش کنید' }, { status: 403 });
  }
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
  if (isReporter) {
    neighborhoodId = session.neighborhoodId || null;
    featured = false;
  }
  const sanitizedBody = sanitizeHtml(bodyText);
  const news = await prisma.news.update({
    where: { id },
    data: {
      title,
      summary: summary ?? null,
      body: sanitizedBody,
      imageUrl: imageUrl ?? null,
      videoUrl: videoUrl ?? null,
      categories: {
        set: (categoryIds as string[]).map((cid: string) => ({ id: cid })),
      },
      neighborhoodId: neighborhoodId || null,
      published: Boolean(published),
      featured: Boolean(featured),
    },
    include: { categories: true },
  });
  return NextResponse.json(news);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.news.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
