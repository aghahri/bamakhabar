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
  const existing = await prisma.news.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!existing) return NextResponse.json({ error: 'خبر یافت نشد' }, { status: 404 });
  const reporterNeighborhoodId = session.type === 'user' ? session.neighborhoodId : null;
  const isReporter = session.type === 'user' && session.role === 'REPORTER';
  const setadCategory = await prisma.category.findUnique({ where: { slug: 'setad-2020' } });
  const existingIsSetad = setadCategory && existing.categories.some((c) => c.id === setadCategory.id);
  if (isReporter && existingIsSetad) {
    return NextResponse.json(
      { error: 'ویرایش اخبار ستاد توانمندسازی محلات ۲۰۲۰ فقط برای ادیتور یا مدیر امکان‌پذیر است.' },
      { status: 403 }
    );
  }
  if (isReporter && existing.neighborhoodId !== reporterNeighborhoodId) {
    return NextResponse.json({ error: 'فقط اخبار محله خود را می‌توانید ویرایش کنید' }, { status: 403 });
  }
  const body = await req.json();
  let {
    title,
    summary,
    body: bodyText,
    imageUrl,
    videoUrl,
    imageUrls,
    videoUrls,
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
  if (setadCategory && (categoryIds as string[]).includes(setadCategory.id) && isReporter) {
    return NextResponse.json(
      { error: 'انتساب خبر به ستاد توانمندسازی محلات ۲۰۲۰ فقط برای ادیتور یا مدیر امکان‌پذیر است.' },
      { status: 403 }
    );
  }
  if (isReporter) {
    neighborhoodId = reporterNeighborhoodId ?? null;
    featured = false;
  }

  const imageUrlsArr: string[] = Array.isArray(imageUrls) ? imageUrls : imageUrl ? [imageUrl] : [];
  const videoUrlsArr: string[] = Array.isArray(videoUrls) ? videoUrls : videoUrl ? [videoUrl] : [];

  const sanitizedBody = sanitizeHtml(bodyText);
  const news = await prisma.news.update({
    where: { id },
    data: {
      title,
      summary: summary ?? null,
      body: sanitizedBody,
      imageUrl: imageUrlsArr[0] ?? null,
      videoUrl: videoUrlsArr[0] ?? null,
      imageUrls: imageUrlsArr,
      videoUrls: videoUrlsArr,
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
