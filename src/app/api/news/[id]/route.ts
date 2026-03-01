import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id },
    include: { category: true, neighborhood: true },
  });
  if (!news) return NextResponse.json({ error: 'خبر یافت نشد' }, { status: 404 });
  return NextResponse.json(news);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
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
  const news = await prisma.news.update({
    where: { id },
    data: {
      title,
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
