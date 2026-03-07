'use client';

import { useState } from 'react';

export function RecomputeNeighborhoodStatus() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRecompute() {
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/neighborhood-status', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'خطا در محاسبه');
        return;
      }
      setMessage(`وضعیت ${data.updated} محله به‌روزرسانی شد. (سبز/زرد/قرمز بر اساس اخبار ۱۴ روز اخیر)`);
    } catch {
      setMessage('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-800 mb-2">وضعیت و رنکینگ محلات (هوش مصنوعی فاز ۱)</h2>
      <p className="text-sm text-gray-600 mb-3">
        بر اساس اخبار ۱۴ روز اخیر هر محله، امتیاز و رنگ (سبز / زرد / قرمز) محاسبه و در صفحهٔ محلات نمایش داده می‌شود.
      </p>
      <button
        type="button"
        onClick={handleRecompute}
        disabled={loading}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? 'در حال محاسبه...' : 'محاسبه وضعیت همه محله‌ها'}
      </button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
