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

export async function getCitiesByProvince(provinceSlug: string): Promise<CityItem[]> {
  const rows = await prisma.neighborhood.findMany({
    where: { provinceSlug },
    select: { city: true, citySlug: true },
    distinct: ['citySlug'],
    orderBy: { city: 'asc' },
  });
  return rows
    .filter((r) => r.city && r.citySlug)
    .map((r) => ({ name: r.city!, slug: r.citySlug! }));
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
  return prisma.neighborhood.findFirst({
    where: { provinceSlug, citySlug, slug: neighborhoodSlug },
    include: {
      news: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: { categories: true },
      },
    },
  });
}
