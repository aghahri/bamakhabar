import { NextResponse } from 'next/server';

const IRANREGIONS_BASE = process.env.IRANREGIONS_API_URL || 'https://iranregions.com';
const CACHE_MAX_AGE = 300;

export type IranRegionsSummaryMap = {
  map_id: string;
  map_name: string;
  feature_count: number;
  view_url: string;
};

export type IranRegionsSummaryResponse = {
  success: boolean;
  base_url?: string;
  maps: IranRegionsSummaryMap[];
  total_maps: number;
  total_features: number;
  error?: string;
};

export async function GET() {
  try {
    const res = await fetch(`${IRANREGIONS_BASE}/api/public/summary`, {
      next: { revalidate: CACHE_MAX_AGE },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          success: false,
          maps: [],
          total_maps: 0,
          total_features: 0,
          error: text || res.statusText,
        },
        { status: 502 }
      );
    }
    const data: IranRegionsSummaryResponse = await res.json();
    const base = IRANREGIONS_BASE.replace(/\/$/, '');
    if (data.maps && Array.isArray(data.maps)) {
      data.maps = data.maps.map((m) => ({
        ...m,
        view_url: m.view_url.startsWith('http')
          ? m.view_url
          : `${base}${m.view_url.startsWith('/') ? '' : '/'}${m.view_url}`,
      }));
    }
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        maps: [],
        total_maps: 0,
        total_features: 0,
        error: message,
      },
      { status: 502 }
    );
  }
}
