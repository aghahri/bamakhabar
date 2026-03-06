import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  if (!pathSegments?.length || pathSegments[0] !== 'uploads') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const filePath = path.join(UPLOADS_DIR, ...pathSegments.slice(1));
  const resolved = path.normalize(filePath);
  if (!resolved.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const st = await stat(resolved);
    if (!st.isFile()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const range = req.headers.get('range');
    const buffer = await readFile(resolved);
    const size = buffer.length;
    if (range && range.startsWith('bytes=') && (ext === '.mp4' || ext === '.webm' || ext === '.mov')) {
      const [startStr, endStr] = range.replace('bytes=', '').split('-');
      const start = parseInt(startStr, 10) || 0;
      const end = endStr ? parseInt(endStr, 10) : size - 1;
      const chunk = buffer.subarray(start, Math.min(end + 1, size));
      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(chunk.length),
          'Content-Range': `bytes ${start}-${start + chunk.length - 1}/${size}`,
          'Accept-Ranges': 'bytes',
        },
      });
    }
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
