import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .toLowerCase();
}

export async function GET() {
  // برای اینکه دسته‌های موزیک/ویدیو حتی بدون اجرای seed مجدد هم همیشه وجود داشته باشند،
  // قبل از برگشت لیست، آن‌ها را upsert می‌کنیم.
  await Promise.all([
    prisma.category.upsert({
      where: { slug: 'music' },
      update: {},
      create: { name: 'موزیک', slug: 'music', order: 9 },
    }),
    prisma.category.upsert({
      where: { slug: 'video' },
      update: {},
      create: { name: 'ویدیو', slug: 'video', order: 10 },
    }),
  ]);

  const list = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, slug: inputSlug, order } = await req.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'نام دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }
    let slug = (inputSlug && String(inputSlug).trim()) || slugify(name);
    slug = slugify(slug) || slugify(name);
    const orderNum = typeof order === 'number' ? order : 0;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const created = await prisma.category.create({
      data: { name: name.trim(), slug, order: orderNum },
    });

    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا در ایجاد دسته‌بندی' }, { status: 500 });
  }
}
