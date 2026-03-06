/**
 * ایمپورت محلات از فایل‌های اکسل داخل data/mahallat
 * استفاده: npx tsx scripts/import-mahallat.ts
 * قبل از اجرا: npm install && npx prisma generate
 */
import * as XLSX from 'xlsx';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MAHALLAT_DIR = path.join(process.cwd(), 'data', 'mahallat');

function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .toLowerCase();
}

const PROVINCE_PREFIX = 'اسامی محلات استان ';
const PROVINCE_PREFIX2 = 'نهایی ';
const PROVINCE_SUFFIX = 'استان ';

function getProvinceFromFilename(filename: string): string | null {
  const base = path.basename(filename, '.xlsx');
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

function getCell(row: Row, ...colNames: string[]): string {
  const key = findColumn(row, ...colNames);
  if (!key) return '';
  const v = row[key];
  if (v == null) return '';
  return String(v).trim();
}

function parseSheet(workbook: XLSX.WorkBook, provinceFromFile: string | null): Array<{ province: string; city: string; name: string }> {
  const out: Array<{ province: string; city: string; name: string }> = [];
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return out;
  const sheet = workbook.Sheets[sheetName];
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
    out.push({
      province: prov,
      city: city,
      name: name,
    });
  }
  return out;
}

async function main() {
  let files: string[];
  try {
    files = readdirSync(MAHALLAT_DIR).filter((f) => f.endsWith('.xlsx'));
  } catch {
    console.error('پوشه data/mahallat یافت نشد یا خالی است.');
    process.exit(1);
  }

  const all: Array<{ province: string; city: string; name: string }> = [];
  for (const file of files) {
    const fullPath = path.join(MAHALLAT_DIR, file);
    if (statSync(fullPath).size === 0) continue;
    try {
      const wb = XLSX.readFile(fullPath, { type: 'file', cellText: true, cellDates: true });
      const provinceFromFile = getProvinceFromFilename(file);
      const rows = parseSheet(wb, provinceFromFile);
      for (const r of rows) {
        if (r.name) all.push(r);
      }
    } catch (e) {
      console.warn('خطا در خواندن', file, e);
    }
  }

  let created = 0;
  let updated = 0;
  const seen = new Set<string>();

  for (const r of all) {
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
      const uniqueSlug = await ensureUniqueSlug(baseSlug);
      await prisma.neighborhood.create({
        data: { ...data, slug: uniqueSlug },
      });
      created++;
    }
  }

  console.log('پایان ایمپورت. ایجاد:', created, 'بروزرسانی:', updated);
  await prisma.$disconnect();
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const exists = await prisma.neighborhood.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${++n}`;
  }
}

main();
