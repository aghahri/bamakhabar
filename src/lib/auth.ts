import { cookies } from 'next/headers';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';

export const COOKIE_NAME = 'bamakhabar_session';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export type SessionAdmin = { type: 'admin'; id: string; username: string };
export type SessionUser = {
  type: 'user';
  id: string;
  username: string;
  role: 'ADMIN' | 'EDITOR' | 'REPORTER';
  approved: boolean;
  neighborhoodId: string | null;
};
export type Session = SessionAdmin | SessionUser;

export type LoginResult =
  | { ok: true; cookieValue: string }
  | { ok: false; error: string };

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  };
}

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (user) {
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return { ok: false, error: 'نام کاربری یا رمز عبور اشتباه است' };
    if (user.role === 'REPORTER' && !user.approved) {
      return { ok: false, error: 'حساب شما در انتظار تایید مدیر است.' };
    }
    return { ok: true, cookieValue: `user:${user.id}` };
  }
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (admin) {
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return { ok: false, error: 'نام کاربری یا رمز عبور اشتباه است' };
    return { ok: true, cookieValue: `admin:${admin.id}` };
  }
  return { ok: false, error: 'نام کاربری یا رمز عبور اشتباه است' };
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [kind, id] = raw.split(':');
  if (kind === 'admin' && id) {
    const admin = await prisma.admin.findUnique({ where: { id }, select: { id: true, username: true } });
    return admin ? { type: 'admin', id: admin.id, username: admin.username } : null;
  }
  if (kind === 'user' && id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, approved: true, neighborhoodId: true },
    });
    return user
      ? {
          type: 'user',
          id: user.id,
          username: user.username,
          role: user.role,
          approved: user.approved,
          neighborhoodId: user.neighborhoodId,
        }
      : null;
  }
  return null;
}

/** دسترسی به پنل ادمین (ادمین یا ادیتور یا خبرنگار تاییدشده) */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (session.type === 'user' && session.role === 'REPORTER' && !session.approved) throw new Error('Unauthorized');
  return session;
}

/** فقط ادمین (جدول Admin) یا کاربر با نقش ADMIN */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (session.type === 'admin') return session;
  if (session.type === 'user' && session.role === 'ADMIN') return session;
  throw new Error('Unauthorized');
}

/** ادمین یا ادیتور (می‌توانند هر خبری را ویرایش/حذف و منتشر کنند) */
export async function requireEditorOrAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (session.type === 'admin') return session;
  if (session.type === 'user' && (session.role === 'ADMIN' || session.role === 'EDITOR')) return session;
  if (session.type === 'user' && session.role === 'REPORTER' && session.approved) return session;
  throw new Error('Unauthorized');
}
