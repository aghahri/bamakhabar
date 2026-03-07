import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { neighborhood: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json(users.map((u) => ({ ...u, password: undefined })));
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { username, password, name, role, neighborhoodId } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'نام کاربری و رمز عبور الزامی است' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'رمز عبور حداقل ۸ کاراکتر' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'این نام کاربری قبلاً ثبت شده' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashed,
        name: name?.trim() || null,
        role: role === 'ADMIN' || role === 'EDITOR' ? role : 'REPORTER',
        approved: role === 'REPORTER' ? false : true,
        neighborhoodId: role === 'REPORTER' && neighborhoodId ? neighborhoodId : null,
      },
      include: { neighborhood: { select: { name: true } } },
    });
    return NextResponse.json({ ...user, password: undefined });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطا در ایجاد کاربر' }, { status: 500 });
  }
}
