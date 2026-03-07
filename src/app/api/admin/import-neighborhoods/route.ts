import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getProvinceFromFilename,
  parseXlsxBuffer,
  upsertNeighborhoodsFromRows,
  type MahallatRow,
} from '@/lib/import-mahallat';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'بدنه درخواست معتبر نیست' },
      { status: 400 }
    );
  }

  const files = formData.getAll('file') as File[];
  if (!files?.length) {
    return NextResponse.json(
      { error: 'حداقل یک فایل xlsx یا zip ارسال کنید' },
      { status: 400 }
    );
  }

  const allRows: MahallatRow[] = [];

  for (const file of files) {
    if (!file?.size) continue;
    const name = file.name || '';
    const buf = Buffer.from(await file.arrayBuffer());

    if (name.toLowerCase().endsWith('.zip')) {
      try {
        const zip = new AdmZip(buf);
        const entries = zip.getEntries();
        for (const entry of entries) {
          if (entry.isDirectory) continue;
          const entryName = entry.entryName;
          if (!entryName.toLowerCase().endsWith('.xlsx')) continue;
          const entryBuf = entry.getData();
          const province = getProvinceFromFilename(entryName);
          const rows = parseXlsxBuffer(entryBuf, province);
          allRows.push(...rows);
        }
      } catch (e) {
        console.error('Zip parse error', e);
        return NextResponse.json(
          { error: 'خطا در خواندن فایل zip' },
          { status: 400 }
        );
      }
    } else if (name.toLowerCase().endsWith('.xlsx')) {
      const province = getProvinceFromFilename(name);
      const rows = parseXlsxBuffer(buf, province);
      allRows.push(...rows);
    }
  }

  if (allRows.length === 0) {
    return NextResponse.json(
      { error: 'هیچ سطر معتبری در فایل‌ها یافت نشد' },
      { status: 400 }
    );
  }

  try {
    const { created, updated } = await upsertNeighborhoodsFromRows(allRows, prisma);
    return NextResponse.json({
      success: true,
      totalRows: allRows.length,
      created,
      updated,
    });
  } catch (e) {
    console.error('Import error', e);
    return NextResponse.json(
      { error: 'خطا در ذخیره محلات در دیتابیس' },
      { status: 500 }
    );
  }
}
