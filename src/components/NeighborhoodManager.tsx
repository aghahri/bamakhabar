'use client';

import { useEffect, useState } from 'react';

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  city: string | null;
}

export function NeighborhoodManager() {
  const [items, setItems] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/neighborhoods');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در دریافت محلات');
      } else {
        setItems(data);
      }
    } catch {
      setError('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(n: Neighborhood) {
    setEditingId(n.id);
    setName(n.name);
    setProvince(n.province || '');
    setCity(n.city || '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setProvince('');
    setCity('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !province || !city) {
      setError('نام محله، استان و شهر را وارد کنید');
      return;
    }
    try {
      const payload = { name, province, city };
      const url = editingId ? `/api/neighborhoods/${editingId}` : '/api/neighborhoods';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در ذخیره محله');
        return;
      }
      resetForm();
      await load();
    } catch {
      setError('خطای اتصال به سرور');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('محله حذف شود؟ اخبار مرتبط فقط از محله جدا می‌شوند.')) return;
    setError('');
    try {
      const res = await fetch(`/api/neighborhoods/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در حذف محله');
        return;
      }
      if (editingId === id) resetForm();
      await load();
    } catch {
      setError('خطای اتصال به سرور');
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4 max-w-2xl"
      >
        <h2 className="text-lg font-bold text-gray-800">
          {editingId ? 'ویرایش محله' : 'افزودن محله جدید'}
        </h2>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام محله *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">استان *</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شهر *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            {editingId ? 'ذخیره تغییرات' : 'افزودن محله'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              انصراف از ویرایش
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">فهرست محلات</h2>
          {loading && <span className="text-xs text-gray-500">در حال بارگذاری...</span>}
        </div>
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-right font-medium text-gray-500">محله</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">استان</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">شهر</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">اسلاگ</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((n) => (
                <tr key={n.id}>
                  <td className="px-3 py-2">{n.name}</td>
                  <td className="px-3 py-2">{n.province ?? '—'}</td>
                  <td className="px-3 py-2">{n.city ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{n.slug}</td>
                  <td className="px-3 py-2 text-xs space-x-2 space-x-reverse">
                    <button
                      type="button"
                      onClick={() => startEdit(n)}
                      className="text-[var(--bama-primary)] hover:underline"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                    محله‌ای ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

