import { NextRequest, NextResponse } from 'next/server';
import { requireEditorOrAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import { normalizeStoredImageUrl } from '@/lib/images';

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
  if (isReporter && existing.createdById !== session.id) {
    return NextResponse.json(
      { error: 'فقط اخبار ثبت‌شده توسط خودتان را می‌توانید ویرایش کنید' },
      { status: 403 }
    );
  }
  if (isReporter && existing.reviewStatus === 'APPROVED') {
    return NextResponse.json(
      { error: 'خبر تاییدشده قابل ویرایش توسط خبرنگار نیست' },
      { status: 403 }
    );
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
    videoThumbnailUrl,
    categoryIds,
    neighborhoodId,
    published,
    featured,
    isBreaking,
    isShort,
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
    isBreaking = false;
  }

  const rawImageUrls: string[] = Array.isArray(imageUrls) ? imageUrls : imageUrl ? [imageUrl] : [];
  const imageUrlsArr: string[] = rawImageUrls
    .map((u) => normalizeStoredImageUrl(u))
    .filter((u): u is string => Boolean(u));
  const videoUrlsArr: string[] = Array.isArray(videoUrls) ? videoUrls : videoUrl ? [videoUrl] : [];
  const videoThumb =
    videoUrlsArr.length > 0 && typeof videoThumbnailUrl === 'string' && videoThumbnailUrl.trim()
      ? videoThumbnailUrl.trim()
      : null;

  const sanitizedBody = sanitizeHtml(bodyText);
  // ویرایش توسط خبرنگار = ارسال مجدد برای بازبینی: غیرمنتشر و در انتظار تایید.
  // ادمین/ادیتور وضعیت بازبینی را تغییر نمی‌دهند (از مسیر /review انجام می‌شود).
  const reporterResubmit = isReporter
    ? {
        published: false,
        reviewStatus: 'PENDING' as const,
        reviewedAt: null,
        reviewedById: null,
      }
    : { published: Boolean(published) };
  const news = await prisma.news.update({
    where: { id },
    data: {
      title,
      summary: summary ?? null,
      body: sanitizedBody,
      imageUrl: imageUrlsArr[0] ?? null,
      videoUrl: videoUrlsArr[0] ?? null,
      videoThumbnailUrl: videoThumb,
      imageUrls: imageUrlsArr,
      videoUrls: videoUrlsArr,
      categories: {
        set: (categoryIds as string[]).map((cid: string) => ({ id: cid })),
      },
      neighborhoodId: neighborhoodId || null,
      ...reporterResubmit,
      featured: Boolean(featured),
      isBreaking: Boolean(isBreaking),
      isShort: videoUrlsArr.length > 0 ? Boolean(isShort) : false,
    },
    include: { categories: true },
  });
  return NextResponse.json(news);
}

export async function DELETE(
  _req: NextRequest,
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

  if (session.type === 'user' && session.role === 'REPORTER') {
    const reporterNeighborhoodId = session.neighborhoodId;
    if (!reporterNeighborhoodId || existing.neighborhoodId !== reporterNeighborhoodId) {
      return NextResponse.json(
        { error: 'فقط اخبار محله خود را می‌توانید حذف کنید' },
        { status: 403 }
      );
    }
  }

  await prisma.news.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
