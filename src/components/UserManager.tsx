'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  name: string | null;
  role: string;
  approved: boolean;
  neighborhoodId: string | null;
  neighborhood?: { name: string } | null;
}

interface Neighborhood { id: string; name: string; slug: string; province: string | null; city: string | null }

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'REPORTER' | 'EDITOR' | 'ADMIN'>('REPORTER');
  const [neighborhoodId, setNeighborhoodId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [uRes, nRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/neighborhoods'),
      ]);
      const uData = await uRes.json();
      const nData = await nRes.json();
      if (!uRes.ok) setError(uData.error || 'خطا در دریافت کاربران');
      else setUsers(uData);
      if (nRes.ok) setNeighborhoods(nData);
    } catch {
      setError('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('نام کاربری و رمز عبور الزامی است');
      return;
    }
    if (password.length < 8) {
      setError('رمز عبور حداقل ۸ کاراکتر');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          name: name.trim() || null,
          role,
          neighborhoodId: role === 'REPORTER' && neighborhoodId ? neighborhoodId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در ایجاد کاربر');
        return;
      }
      setUsername('');
      setPassword('');
      setName('');
      setNeighborhoodId('');
      await load();
    } catch {
      setError('خطای اتصال به سرور');
    }
  }

  async function toggleApproved(id: string, approved: boolean) {
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'خطا');
        return;
      }
      await load();
    } catch {
      setError('خطای اتصال به سرور');
    }
  }

  async function remove(id: string) {
    if (!confirm('این کاربر حذف شود؟')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'خطا در حذف');
        return;
      }
      await load();
    } catch {
      setError('خطای اتصال به سرور');
    }
  }

  const roleLabel = (r: string) => (r === 'ADMIN' ? 'مدیر' : r === 'EDITOR' ? 'ویرایشگر' : 'خبرنگار محله');

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-4">
        <h2 className="text-lg font-bold text-gray-800">افزودن کاربر</h2>
        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری *</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور * (حداقل ۸ کاراکتر)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required minLength={8} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام نمایشی</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'REPORTER' | 'EDITOR' | 'ADMIN')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="REPORTER">خبرنگار محله</option>
              <option value="EDITOR">ویرایشگر</option>
              <option value="ADMIN">مدیر</option>
            </select>
          </div>
          {role === 'REPORTER' && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">محله (برای خبرنگار)</label>
              <select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">انتخاب محله</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>{n.name} {n.city ? `(${n.city})` : ''}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button type="submit" className="btn-primary">افزودن کاربر</button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">لیست کاربران</h2>
          {loading && <span className="text-xs text-gray-500">در حال بارگذاری...</span>}
        </div>
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-right font-medium text-gray-500">کاربری</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">نقش</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">محله</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">تایید (خبرنگار)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2">{u.username} {u.name ? `(${u.name})` : ''}</td>
                  <td className="px-3 py-2">{roleLabel(u.role)}</td>
                  <td className="px-3 py-2">{u.neighborhood?.name ?? '—'}</td>
                  <td className="px-3 py-2">
                    {u.role === 'REPORTER' && (
                      <button
                        type="button"
                        onClick={() => toggleApproved(u.id, !u.approved)}
                        className={`text-xs px-2 py-1 rounded ${u.approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
                      >
                        {u.approved ? 'تایید شده' : 'تایید'}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => remove(u.id)} className="text-red-600 hover:underline text-xs">حذف</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-500">کاربری ثبت نشده است.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
