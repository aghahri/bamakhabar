/**
 * منطق مشترک ایمپورت محلات از اکسل (برای اسکریپت و API آپلود)
 */
import * as XLSX from 'xlsx';
import type { PrismaClient } from '@prisma/client';

export type MahallatRow = { province: string; city: string; name: string };

function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .toLowerCase();
}

const PROVINCE_PREFIX = 'اسامی محلات استان ';
const PROVINCE_SUFFIX = 'استان ';
/** از نام فایل استان را استخراج می‌کند (برای فایل‌های بدون ستون استان) */
export function getProvinceFromFilename(filename: string): string | null {
  const base = filename.replace(/\.xlsx?$/i, '').trim();
  if (base.includes(PROVINCE_PREFIX)) {
    const p = base.split(PROVINCE_PREFIX)[1]?.trim();
    return p || null;
  }
  if (base.includes(PROVINCE_SUFFIX)) {
    const idx = base.indexOf(PROVINCE_SUFFIX);
    const after = base.slice(idx + PROVINCE_SUFFIX.length).trim();
    const end = after.indexOf('.') >= 0 ? after.split('.')[0] : after;
    return end?.trim() || null;
  }
  if (base.includes('نهایی')) {
    const m = base.match(/نهایی\s*(?:استان\s*)?(.+?)(?:\s*\.xlsx)?$/);
    return m ? m[1].trim() : null;
  }
  return null;
}

type Row = Record<string, unknown>;

function findColumn(row: Row, ...names: string[]): string | null {
  for (const name of names) {
    for (const key of Object.keys(row)) {
      const k = String(key).trim();
      if (k === name || k.includes(name)) return k;
    }
  }
  return null;
}

/** یک بافر xlsx را می‌خواند و آرایه‌ای از سطرهای استان/شهر/محله برمی‌گرداند */
export function parseXlsxBuffer(
  buffer: Buffer,
  provinceFromFile: string | null = null
): MahallatRow[] {
  const out: MahallatRow[] = [];
  const wb = XLSX.read(buffer, { type: 'buffer', cellText: true, cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return out;
  const sheet = wb.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (rows.length === 0) return out;

  const first = rows[0];
  const provinceCol = findColumn(first, 'استان', 'province');
  const cityCol = findColumn(first, 'شهر', 'شهرستان', 'city');
  const nameCol = findColumn(first, 'محله', 'نام محله', 'نام', 'neighborhood', 'name');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const province = provinceCol ? String(row[provinceCol] ?? '').trim() : '';
    const city = cityCol ? String(row[cityCol] ?? '').trim() : '';
    const name = nameCol ? String(row[nameCol] ?? '').trim() : '';

    const prov = province || provinceFromFile || '';
    if (!name) continue;
    if (/^\d+$/.test(name)) continue;
    if (name.length < 2) continue;
    if (['محله', 'نام محله', 'نام', 'شهر', 'استان'].includes(name)) continue;
    out.push({ province: prov, city, name });
  }
  return out;
}

export type UpsertResult = { created: number; updated: number };

/** سطرهای استخراج‌شده را در دیتابیس upsert می‌کند */
export async function upsertNeighborhoodsFromRows(
  rows: MahallatRow[],
  prisma: PrismaClient
): Promise<UpsertResult> {
  let created = 0;
  let updated = 0;
  const seen = new Set<string>();

  for (const r of rows) {
    const provinceSlug = slugify(r.province) || 'unknown';
    const citySlug = slugify(r.city) || 'unknown';
    const baseSlug = slugify(r.name) || slugify(String(Date.now()));
    const key = `${provinceSlug}-${citySlug}-${r.name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const existing = await prisma.neighborhood.findFirst({
      where: {
        name: r.name,
        provinceSlug,
        citySlug,
      },
    });

    const data = {
      name: r.name,
      province: r.province || null,
      provinceSlug: provinceSlug === 'unknown' ? null : provinceSlug,
      city: r.city || null,
      citySlug: citySlug === 'unknown' ? null : citySlug,
    };

    if (existing) {
      await prisma.neighborhood.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      const uniqueSlug = await ensureUniqueSlug(prisma, baseSlug);
      await prisma.neighborhood.create({
        data: { ...data, slug: uniqueSlug },
      });
      created++;
    }
  }

  return { created, updated };
}

async function ensureUniqueSlug(prisma: PrismaClient, base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const exists = await prisma.neighborhood.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${++n}`;
  }
}
