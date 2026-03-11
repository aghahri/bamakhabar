import { NextRequest, NextResponse } from 'next/server';
import { getCitiesByProvince } from '@/lib/locations';

export async function GET(request: NextRequest) {
  const provinceSlug = request.nextUrl.searchParams.get('province');
  if (!provinceSlug) {
    return NextResponse.json([]);
  }
  const cities = await getCitiesByProvince(provinceSlug);
  return NextResponse.json(cities);
}
