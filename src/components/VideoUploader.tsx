'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VideoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

type Mode = 'url' | 'upload';

export function VideoUploader({ value, onChange }: VideoUploaderProps) {
  const [mode, setMode] = useState<Mode>(value ? (value.startsWith('/uploads/') ? 'upload' : 'url') : 'url');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('/uploads/') ? value : '');
  useEffect(() => {
    if (!value) {
      setUrlInput('');
      return;
    }
    if (value.startsWith('/uploads/')) setMode('upload');
    else setUrlInput(value);
  }, [value]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-video', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در آپلود ویدیو');
        return;
      }
      onChange(data.url);
      setMode('upload');
    } catch {
      setError('خطای اتصال به سرور');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) upload(file);
    else setError('فقط فایل ویدیو (MP4، WebM) مجاز است');
  }, [upload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [upload]);

  const applyUrl = () => {
    setError('');
    const u = urlInput.trim();
    if (u) onChange(u);
    else onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => { setMode('url'); setError(''); }}
          className={`px-3 py-1.5 text-sm rounded ${mode === 'url' ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          لینک ویدیو
        </button>
        <button
          type="button"
          onClick={() => { setMode('upload'); setError(''); }}
          className={`px-3 py-1.5 text-sm rounded ${mode === 'upload' ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          آپلود از دستگاه
        </button>
      </div>

      {mode === 'url' && (
        <div className="space-y-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={applyUrl}
            placeholder="https://... یا /uploads/video-xxx.mp4"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
          <p className="text-xs text-gray-500">
            لینک مستقیم فایل (mp4) یا لینک از آپارات/یوتیوب. برای نمایش روی سایت ترجیحاً ویدیو را آپلود کنید.
          </p>
        </div>
      )}

      {mode === 'upload' && (
        <>
          {value && value.startsWith('/uploads/') ? (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-black max-w-lg">
                <video src={value} controls className="w-full max-h-48" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-sm text-blue-600 hover:underline"
                >
                  تغییر ویدیو
                </button>
                <button
                  type="button"
                  onClick={() => { onChange(''); setUrlInput(''); }}
                  className="text-sm text-red-600 hover:underline"
                >
                  حذف ویدیو
                </button>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer
                transition-colors border-gray-300 hover:border-gray-400 bg-gray-50
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploading ? (
                <span className="text-sm text-gray-500">در حال آپلود ویدیو...</span>
              ) : (
                <>
                  <span className="text-2xl mb-1">🎬</span>
                  <span className="text-sm text-gray-500">کلیک کنید یا ویدیو را اینجا رها کنید</span>
                  <span className="text-xs text-gray-400 mt-1">MP4، WebM — حداکثر ۱۰۰ مگابایت</span>
                </>
              )}
            </div>
          )}
        </>
      )}

      {value && mode === 'url' && value.startsWith('http') && (
        <p className="text-xs text-gray-500">لینک خارجی تنظیم شده. برای پخش در سایت ممکن است محدودیت CORS داشته باشد.</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
