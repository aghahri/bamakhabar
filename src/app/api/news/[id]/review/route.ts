import { NextRequest, NextResponse } from 'next/server';
import { requireEditorOrAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * تایید سردبیری اخبار (مخصوص ادمین/ادیتور).
 * بدنه: { action: 'APPROVE' | 'NEEDS_REVISION' }
 * خبرنگار اجازهٔ تایید/بازگردانی ندارد (جلوگیری از خودتاییدی).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // فقط ادمین یا ادیتور؛ خبرنگار مجاز نیست خبری را تایید کند.
  const isEditorOrAdmin =
    session.type === 'admin' ||
    (session.type === 'user' && (session.role === 'ADMIN' || session.role === 'EDITOR'));
  if (!isEditorOrAdmin) {
    return NextResponse.json(
      { error: 'فقط ادیتور یا مدیر می‌تواند خبر را تایید یا بازگرداند.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const existing = await prisma.news.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'خبر یافت نشد' }, { status: 404 });

  let action: unknown;
  try {
    ({ action } = await req.json());
  } catch {
    return NextResponse.json({ error: 'درخواست نامعتبر' }, { status: 400 });
  }
  if (action !== 'APPROVE' && action !== 'NEEDS_REVISION') {
    return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 });
  }

  const news = await prisma.news.update({
    where: { id },
    data:
      action === 'APPROVE'
        ? {
            reviewStatus: 'APPROVED',
            published: true,
            reviewedAt: new Date(),
            reviewedById: session.id,
          }
        : {
            reviewStatus: 'NEEDS_REVISION',
            published: false,
            reviewedAt: new Date(),
            reviewedById: session.id,
          },
    select: { id: true, reviewStatus: true, published: true },
  });
  return NextResponse.json(news);
}
