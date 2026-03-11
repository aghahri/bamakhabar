import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, neighborhoodIds } = body;
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'ایمیل الزامی است' }, { status: 400 });
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return NextResponse.json({ error: 'ایمیل معتبر وارد کنید' }, { status: 400 });
    }
    const ids = Array.isArray(neighborhoodIds)
      ? neighborhoodIds.filter((id: unknown) => typeof id === 'string')
      : [];

    await prisma.newsletterSubscription.upsert({
      where: { email: trimmed },
      create: { email: trimmed, neighborhoodIds: ids },
      update: { neighborhoodIds: ids },
    });

    return NextResponse.json({
      success: true,
      message: 'ثبت نام در خبرنامه با موفقیت انجام شد. با انتشار خبر جدید در محلات انتخاب‌شده ایمیل دریافت می‌کنید.',
    });
  } catch (e) {
    console.error('Newsletter subscribe error:', e);
    return NextResponse.json({ error: 'خطا در ثبت نام' }, { status: 500 });
  }
}
