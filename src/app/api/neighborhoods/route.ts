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
  const list = await prisma.neighborhood.findMany({
    orderBy: [{ province: 'asc' }, { city: 'asc' }, { name: 'asc' }],
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
    const { name, province, city } = await req.json();
    if (!name || !province || !city) {
      return NextResponse.json(
        { error: 'نام محله، استان و شهر الزامی است' },
        { status: 400 }
      );
    }
    let slug = slugify(name);
    const provinceSlug = slugify(province);
    const citySlug = slugify(city);

    const existing = await prisma.neighborhood.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const created = await prisma.neighborhood.create({
      data: {
        name,
        slug,
        province,
        provinceSlug,
        city,
        citySlug,
      },
    });

    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا در ایجاد محله' }, { status: 500 });
  }
}

