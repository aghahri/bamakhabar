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
  const { name, province, city, description } = body;
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
  if (existing && existing.id !== id) {
    slug = `${slug}-${Date.now()}`;
  }

  const updated = await prisma.neighborhood.update({
    where: { id },
    data: {
      name,
      slug,
      province,
      provinceSlug,
      city,
      citySlug,
      description: typeof description === 'string' ? description : undefined,
    },
  });

  return NextResponse.json(updated);
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
  await prisma.news.updateMany({
    where: { neighborhoodId: id },
    data: { neighborhoodId: null },
  });
  await prisma.neighborhood.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

