/**
 * ایمپورت محلات از فایل‌های اکسل داخل data/mahallat
 * استفاده: npx tsx scripts/import-mahallat.ts
 * قبل از اجرا: npm install && npx prisma generate
 */
import * as XLSX from 'xlsx';
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  getProvinceFromFilename,
  parseXlsxBuffer,
  upsertNeighborhoodsFromRows,
} from '../src/lib/import-mahallat';

const prisma = new PrismaClient();
const MAHALLAT_DIR = path.join(process.cwd(), 'data', 'mahallat');

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
      const buf = readFileSync(fullPath);
      const provinceFromFile = getProvinceFromFilename(path.basename(file));
      const rows = parseXlsxBuffer(buf, provinceFromFile);
      for (const r of rows) {
        if (r.name) all.push(r);
      }
    } catch (e) {
      console.warn('خطا در خواندن', file, e);
    }
  }

  const { created, updated } = await upsertNeighborhoodsFromRows(all, prisma);
  console.log('پایان ایمپورت. ایجاد:', created, 'بروزرسانی:', updated);
  await prisma.$disconnect();
}

main();
