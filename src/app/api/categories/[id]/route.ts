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
  if (existing && existing.id !== id) {
    slug = `${slug}-${Date.now()}`;
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { name: name.trim(), slug, order: orderNum },
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
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
