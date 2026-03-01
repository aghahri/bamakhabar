import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const list = await prisma.neighborhood.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(list);
}
