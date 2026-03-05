import { NextResponse } from 'next/server';

const CACHE_MAX_AGE = 120; // 2 minutes

type OilItem = { name: string; price: number; change_24h: number | null; currency: string };
type CryptoItem = { id: string; name: string; price: number; change24h: number };

export async function GET() {
  const [oilRes, cryptoRes] = await Promise.allSettled([
    fetch('https://api.oilpriceapi.com/v1/demo/prices', { next: { revalidate: CACHE_MAX_AGE } }),
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: CACHE_MAX_AGE } }
    ),
  ]);

  const oil: OilItem[] = [];
  if (oilRes.status === 'fulfilled' && oilRes.value.ok) {
    try {
      const data = await oilRes.value.json();
      const prices = data?.data?.prices ?? [];
      for (const p of prices) {
        if (['BRENT_CRUDE_USD', 'WTI_USD', 'NATURAL_GAS_USD', 'GOLD_USD'].includes(p.code)) {
          oil.push({
            name: p.name,
            price: p.price,
            change_24h: p.change_24h ?? null,
            currency: p.currency ?? 'USD',
          });
        }
      }
    } catch {
      // ignore
    }
  }

  const crypto: CryptoItem[] = [];
  const names: Record<string, string> = { bitcoin: 'بیت‌کوین', ethereum: 'اتریوم', tether: 'تتر' };
  if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
    try {
      const data = await cryptoRes.value.json();
      for (const [id, v] of Object.entries(data as Record<string, { usd: number; usd_24h_change?: number }>)) {
        crypto.push({
          id,
          name: names[id] ?? id,
          price: v.usd,
          change24h: v.usd_24h_change ?? 0,
        });
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json(
    { oil, crypto },
    { headers: { 'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60` } }
  );
}
