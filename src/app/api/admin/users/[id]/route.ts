import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
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
  if (typeof body.approved === 'boolean') {
    await prisma.user.update({
      where: { id },
      data: { approved: body.approved },
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'بدون تغییر' }, { status: 400 });
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
  await prisma.news.updateMany({ where: { createdById: id }, data: { createdById: null } });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
