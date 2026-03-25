'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NewsImage } from './NewsImage';

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
}

export function MultiImageUploader({ values, onChange }: MultiImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const safeValues = useMemo(() => values ?? [], [values]);

  useEffect(() => {
    setError('');
  }, [safeValues.length]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      setError('');
      setUploading(true);
      try {
        const list = Array.isArray(files) ? files : Array.from(files);
        const uploadedUrls: string[] = [];

        for (const file of list) {
          if (!file) continue;
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.error || 'خطا در آپلود');
          }
          if (data?.url) uploadedUrls.push(data.url);
        }

        if (uploadedUrls.length) {
          onChange([...safeValues, ...uploadedUrls]);
        }
      } catch (e: any) {
        setError(e?.message || 'خطا در آپلود');
      } finally {
        setUploading(false);
      }
    },
    [onChange, safeValues]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        upload(e.dataTransfer.files);
      }
    },
    [upload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        upload(e.target.files);
      }
      if (inputRef.current) inputRef.current.value = '';
    },
    [upload]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed cursor-pointer
          transition-colors h-40
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {uploading ? (
          <span className="text-sm text-gray-500">در حال آپلود...</span>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-gray-500">تصاویر را بکشید و رها کنید یا کلیک کنید</span>
            <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF — چند فایل</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {safeValues.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {safeValues.map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <div className="relative w-full aspect-video">
                <NewsImage src={src} alt="پیش‌نمایش" fill className="object-cover" />
              </div>
              <div className="absolute top-2 left-2">
                <button
                  type="button"
                  onClick={() => onChange(safeValues.filter((_, i) => i !== idx))}
                  disabled={uploading}
                  className="px-2 py-1 text-xs rounded bg-black/70 text-white hover:bg-black disabled:opacity-50"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

