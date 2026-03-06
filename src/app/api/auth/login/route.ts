import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getSessionCookieOptions, login } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: 'نام کاربری و رمز عبور الزامی است' }, { status: 400 });
    }
    const result = await login(username, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, result.cookieValue, getSessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
