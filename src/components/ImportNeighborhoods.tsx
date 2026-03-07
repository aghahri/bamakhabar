'use client';

import { useState } from 'react';

export function ImportNeighborhoods() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; totalRows: number } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!file) {
      setError('یک فایل xlsx یا zip انتخاب کنید');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/import-neighborhoods', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در آپلود');
        return;
      }
      setResult({ created: data.created, updated: data.updated, totalRows: data.totalRows });
      setFile(null);
    } catch {
      setError('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">ایمپورت محلات از اکسل</h2>
      <p className="text-sm text-gray-600 mb-4">
        فایل xlsx یا zip حاوی فایل‌های اکسل محلات را انتخاب کنید. پس از آپلود، محلات در دیتابیس ایجاد یا بروزرسانی می‌شوند.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <input
            type="file"
            accept=".xlsx,.zip"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'در حال آپلود...' : 'آپلود و ایمپورت'}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
      {result && (
        <p className="mt-3 text-sm text-green-700">
          انجام شد: {result.totalRows} سطر، {result.created} ایجاد، {result.updated} بروزرسانی.
        </p>
      )}
    </div>
  );
}
