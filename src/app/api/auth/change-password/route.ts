import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'رمز فعلی و رمز جدید الزامی است' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'رمز جدید باید حداقل ۸ کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'رمز جدید باید با رمز فعلی متفاوت باشد' },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    });

    if (!admin) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'رمز فعلی اشتباه است' },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
    }
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
