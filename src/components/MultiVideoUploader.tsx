'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { uploadWithProgress } from '@/lib/upload-with-progress';

type Mode = 'url' | 'upload';

interface MultiVideoUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
}

function resolveVideoSrc(src: string): string {
  if (!src) return src;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/uploads/')) return `/api/media${src}`;
  if (src.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${src}`;
  return src;
}

export function MultiVideoUploader({ values, onChange }: MultiVideoUploaderProps) {
  const [mode, setMode] = useState<Mode>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const safeValues = useMemo(() => values ?? [], [values]);
  const valuesRef = useRef(safeValues);
  useEffect(() => {
    valuesRef.current = safeValues;
  }, [safeValues]);

  useEffect(() => {
    if (!safeValues.length) setUrlInput('');
  }, [safeValues.length]);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError('');
      setUploading(true);
      const list = Array.isArray(files) ? files : Array.from(files);
      setProgress({ current: 0, total: list.length, percent: 0 });
      const uploadedUrls: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (!file) continue;
        setProgress({ current: i + 1, total: list.length, percent: 0 });
        const res = await uploadWithProgress('/api/upload-video', file, (p) =>
          setProgress({ current: i + 1, total: list.length, percent: p })
        );
        if (res.url) {
          uploadedUrls.push(res.url);
        } else if (res.error) {
          errors.push(`${file.name || 'ویدیو'}: ${res.error}`);
        }
      }

      if (uploadedUrls.length) {
        onChange([...valuesRef.current, ...uploadedUrls]);
      }
      if (errors.length) {
        setError(errors.join('\n'));
      }
      setUploading(false);
      setProgress({ current: 0, total: 0, percent: 0 });
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files);
      }
      if (inputRef.current) inputRef.current.value = '';
    },
    [uploadFiles]
  );

  const applyUrls = () => {
    setError('');
    const raw = urlInput
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!raw.length) return;
    onChange([...safeValues, ...raw]);
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setMode('url');
            setError('');
          }}
          className={`px-3 py-1.5 text-sm rounded ${mode === 'url' ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          لینک ویدیو
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('upload');
            setError('');
          }}
          className={`px-3 py-1.5 text-sm rounded ${mode === 'upload' ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          آپلود از دستگاه
        </button>
      </div>

      {mode === 'url' && (
        <div className="space-y-2">
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="هر لینک در یک خط (مثلاً: https://.../file.mp4)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-24"
          />
          <button type="button" onClick={applyUrls} className="px-3 py-2 bg-[var(--bama-primary)] text-white rounded hover:opacity-90">
            افزودن به لیست
          </button>
          <p className="text-xs text-gray-500">
            برای نمایش بهتر، لینک ویدیو باید مستقیم و قابل پخش (mp4/webm) باشد.
          </p>
        </div>
      )}

      {mode === 'upload' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed cursor-pointer
            transition-colors border-gray-300 hover:border-gray-400 bg-gray-50
            ${uploading ? 'opacity-70 pointer-events-none' : ''}
            min-h-[8rem] py-4
          `}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="w-3/4 text-center">
              <span className="text-sm text-gray-600">
                در حال آپلود ویدیو {progress.current} از {progress.total} ({progress.percent}%)
              </span>
              <div className="mt-2 h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-full bg-[var(--bama-primary)] transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">آپلود ویدیوهای حجیم ممکن است چند دقیقه طول بکشد.</p>
            </div>
          ) : (
            <>
              <span className="text-2xl mb-1">🎬</span>
              <span className="text-sm text-gray-500">کلیک کنید یا ویدیوها را اینجا رها کنید</span>
              <span className="text-xs text-gray-400 mt-1">MP4, WebM, MOV — چند فایل (تا ۵۰۰ مگابایت هر فایل)</span>
            </>
          )}
        </div>
      )}

      {safeValues.length > 0 && (
        <div className="space-y-4">
          {safeValues.map((src, idx) => (
            <div key={`${src}-${idx}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-xs text-gray-500">ویدیو #{idx + 1}</p>
                <button
                  type="button"
                  onClick={() => onChange(safeValues.filter((_, i) => i !== idx))}
                  disabled={uploading}
                  className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  حذف
                </button>
              </div>
              <video src={resolveVideoSrc(src)} controls className="w-full rounded bg-black max-h-64" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>}
    </div>
  );
}
