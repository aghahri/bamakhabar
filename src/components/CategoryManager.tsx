'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export function CategoryManager() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در دریافت دسته‌بندی‌ها');
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

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setOrder(c.order);
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setSlug('');
    setOrder(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('نام دسته‌بندی را وارد کنید');
      return;
    }
    try {
      const payload = { name: name.trim(), slug: slug.trim() || undefined, order };
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در ذخیره دسته‌بندی');
        return;
      }
      resetForm();
      await load();
    } catch {
      setError('خطای اتصال به سرور');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('این دسته‌بندی حذف شود؟ ارتباط با اخبار از بین می‌رود.')) return;
    setError('');
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در حذف دسته‌بندی');
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
          {editingId ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
        </h2>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام دسته *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="مثلاً سیاسی، نظامی"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسلاگ (اختیاری)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="مثلاً siasi, nezami"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ترتیب نمایش</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min={0}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            {editingId ? 'ذخیره تغییرات' : 'افزودن دسته'}
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
          <h2 className="text-sm font-semibold text-gray-800">فهرست دسته‌بندی‌ها</h2>
          {loading && <span className="text-xs text-gray-500">در حال بارگذاری...</span>}
        </div>
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-right font-medium text-gray-500">نام</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">اسلاگ</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">ترتیب</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{c.slug}</td>
                  <td className="px-3 py-2">{c.order}</td>
                  <td className="px-3 py-2 text-xs space-x-2 space-x-reverse">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-[var(--bama-primary)] hover:underline"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                    دسته‌ای ثبت نشده است.
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
