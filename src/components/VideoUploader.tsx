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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setUrlInput('');
      setUploadSuccess(false);
      return;
    }
    if (value.startsWith('/uploads/')) setMode('upload');
    else setUrlInput(value);
  }, [value]);

  const upload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-video', { method: 'POST', body: formData });
      const text = await res.text();
      if (res.status === 413) {
        setError('سرور به‌دلیل حجم درخواست آن را رد کرد. روی سرور، در nginx (یا پروکسی دیگر) مقدار client_max_body_size را افزایش دهید (مثلاً 100m).');
        return;
      }
      let data: { url?: string; error?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError(text || `خطای سرور (${res.status})`);
        return;
      }
      if (!res.ok) {
        setError(data.error || 'خطا در آپلود ویدیو');
        return;
      }
      if (data.url) onChange(data.url);
      setMode('upload');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (e) {
      setError('خطای اتصال به سرور. اینترنت و آدرس سایت را بررسی کنید.');
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

  const hasValue = Boolean(value?.trim());
  const isUploaded = hasValue && value.startsWith('/uploads/');

  return (
    <div className="space-y-3">
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 text-sm border border-green-200">
          <span>✓</span>
          <span>ویدیو با موفقیت آپلود شد و در خبر نمایش داده می‌شود.</span>
        </div>
      )}

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

      {hasValue && (
        <div className="space-y-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-600">ویدیو تنظیم شده:</p>
          {isUploaded ? (
            <div className="rounded overflow-hidden border border-gray-200 bg-black max-w-lg">
              <video src={value} controls preload="metadata" className="w-full max-h-48" />
            </div>
          ) : (
            <p className="text-sm text-gray-700 break-all">{value}</p>
          )}
          <div className="flex gap-3 pt-1">
            {isUploaded && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm text-blue-600 hover:underline"
              >
                تغییر ویدیو
              </button>
            )}
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
      )}

      {!hasValue && mode === 'url' && (
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
            لینک مستقیم فایل (mp4) یا لینک از آپارات/یوتیوب. برای اطمینان از نمایش، ویدیو را آپلود کنید.
          </p>
        </div>
      )}

      {!hasValue && mode === 'upload' && (
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

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
