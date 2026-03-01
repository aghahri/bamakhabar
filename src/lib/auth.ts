import { cookies } from 'next/headers';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';

const COOKIE_NAME = 'bamakhabar_admin';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function login(username: string, password: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return false;
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, admin.id, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ id: string; username: string } | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_NAME)?.value;
  if (!id) return null;
  const admin = await prisma.admin.findUnique({ where: { id }, select: { id: true, username: true } });
  return admin;
}

export async function requireAdmin(): Promise<{ id: string; username: string }> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
