import { prisma } from './prisma';

export type ProvinceItem = { name: string; slug: string };
export type CityItem = { name: string; slug: string };
export type NeighborhoodItem = { id: string; name: string; slug: string; newsCount: number };

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
  }));
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
