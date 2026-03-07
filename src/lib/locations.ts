import { prisma } from './prisma';

export type ProvinceItem = { name: string; slug: string };
export type CityItem = { name: string; slug: string };
export type NeighborhoodItem = { id: string; name: string; slug: string; newsCount: number; statusColor: string | null };

export async function getProvinces(): Promise<ProvinceItem[]> {
  const rows = await prisma.neighborhood.findMany({
    where: { province: { not: null }, provinceSlug: { not: null } },
    select: { province: true, provinceSlug: true },
    distinct: ['provinceSlug'],
    orderBy: { province: 'asc' },
  });
  return rows
    .filter((r) => r.province && r.provinceSlug)
    .map((r) => ({ name: r.province!, slug: r.provinceSlug! }));
}

/** اسلاگ را نرمال می‌کند (کدگشایی، حذف فاصله، کوچک) برای مقایسه */
export function normalizeSlug(s: string): string {
  try {
    return decodeURIComponent(String(s)).trim().toLowerCase();
  } catch {
    return String(s).trim().toLowerCase();
  }
}

export async function getCitiesByProvince(provinceSlug: string): Promise<CityItem[]> {
  const province = await getProvinceBySlug(provinceSlug);
  if (!province) return [];
  const rows = await prisma.neighborhood.findMany({
    where: { provinceSlug: province.slug, city: { not: null }, citySlug: { not: null } },
    select: { city: true, citySlug: true },
    distinct: ['citySlug'],
    orderBy: { city: 'asc' },
  });
  return rows
    .filter((r) => r.city && r.citySlug)
    .map((r) => ({ name: r.city!, slug: r.citySlug! }));
}

/** نام و اسلاگ واقعی استان را از دیتابیس برمی‌گرداند (با نرمال‌سازی اسلاگ) */
export async function getProvinceBySlug(provinceSlug: string): Promise<{ name: string; slug: string } | null> {
  const rows = await prisma.neighborhood.findMany({
    where: { province: { not: null }, provinceSlug: { not: null } },
    select: { province: true, provinceSlug: true },
  });
  const normalized = normalizeSlug(provinceSlug);
  const row = rows.find((r) => r.provinceSlug && normalizeSlug(r.provinceSlug) === normalized);
  return row ? { name: row.province!, slug: row.provinceSlug! } : null;
}

/** نام و اسلاگ واقعی شهر را در یک استان برمی‌گرداند */
export async function getCityBySlug(provinceSlug: string, citySlug: string): Promise<{ name: string; slug: string } | null> {
  const rows = await prisma.neighborhood.findMany({
    where: { provinceSlug: { not: null }, city: { not: null }, citySlug: { not: null } },
    select: { provinceSlug: true, city: true, citySlug: true },
  });
  const provNorm = normalizeSlug(provinceSlug);
  const cityNorm = normalizeSlug(citySlug);
  const row = rows.find(
    (r) =>
      r.provinceSlug &&
      r.citySlug &&
      normalizeSlug(r.provinceSlug) === provNorm &&
      normalizeSlug(r.citySlug) === cityNorm
  );
  return row ? { name: row.city!, slug: row.citySlug! } : null;
}

export async function getNeighborhoodsByCity(
  provinceSlug: string,
  citySlug: string
): Promise<NeighborhoodItem[]> {
  const list = await prisma.neighborhood.findMany({
    where: { provinceSlug, citySlug },
    include: { _count: { select: { news: true } } },
    orderBy: { name: 'asc' },
  });
  return list.map((n) => ({
    id: n.id,
    name: n.name,
    slug: n.slug,
    newsCount: n._count.news,
    statusColor: n.statusColor,
  }));
}

export type NeighborhoodRankItem = {
  id: string;
  name: string;
  slug: string;
  provinceSlug: string | null;
  citySlug: string | null;
  statusColor: string | null;
  statusScore: number | null;
};

export type NeighborhoodRanking = {
  red: NeighborhoodRankItem[];
  yellow: NeighborhoodRankItem[];
  green: NeighborhoodRankItem[];
};

/** پنج محله پرخطر (قرمز)، پنج زرد، پنج سبز برای نمایش رنکینگ */
export async function getNeighborhoodRanking(): Promise<NeighborhoodRanking> {
  const list = await prisma.neighborhood.findMany({
    where: {
      statusColor: { not: null },
      provinceSlug: { not: null },
      citySlug: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      provinceSlug: true,
      citySlug: true,
      statusColor: true,
      statusScore: true,
    },
    orderBy: { statusScore: 'asc' },
  });

  const red = list
    .filter((n) => n.statusColor === 'red')
    .slice(0, 5)
    .map((n) => ({
      id: n.id,
      name: n.name,
      slug: n.slug,
      provinceSlug: n.provinceSlug,
      citySlug: n.citySlug,
      statusColor: n.statusColor,
      statusScore: n.statusScore,
    }));

  const yellow = list
    .filter((n) => n.statusColor === 'yellow')
    .slice(0, 5)
    .map((n) => ({
      id: n.id,
      name: n.name,
      slug: n.slug,
      provinceSlug: n.provinceSlug,
      citySlug: n.citySlug,
      statusColor: n.statusColor,
      statusScore: n.statusScore,
    }));

  const green = list
    .filter((n) => n.statusColor === 'green')
    .slice(0, 5)
    .map((n) => ({
      id: n.id,
      name: n.name,
      slug: n.slug,
      provinceSlug: n.provinceSlug,
      citySlug: n.citySlug,
      statusColor: n.statusColor,
      statusScore: n.statusScore,
    }));

  return { red, yellow, green };
}

export async function getNeighborhoodBySlug(
  provinceSlug: string,
  citySlug: string,
  neighborhoodSlug: string
) {
  const province = await getProvinceBySlug(provinceSlug);
  const city = await getCityBySlug(provinceSlug, citySlug);
  if (!province || !city) return null;
  const rows = await prisma.neighborhood.findMany({
    where: { provinceSlug: province.slug, citySlug: city.slug },
    include: {
      news: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: { categories: true },
      },
    },
  });
  const neighborhoodNorm = normalizeSlug(neighborhoodSlug);
  const found = rows.find((r) => normalizeSlug(r.slug) === neighborhoodNorm);
  return found ?? null;
}
