'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('همه فیلدها الزامی است');
      return;
    }

    if (newPassword.length < 8) {
      setError('رمز جدید باید حداقل ۸ کاراکتر باشد');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('رمز جدید و تکرار آن مطابقت ندارند');
      return;
    }

    if (currentPassword === newPassword) {
      setError('رمز جدید باید با رمز فعلی متفاوت باشد');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'خطا در تغییر رمز عبور');
        return;
      }

      setSuccess('رمز عبور با موفقیت تغییر کرد. در حال انتقال...');
      setTimeout(() => router.push('/admin'), 2000);
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-6">تغییر رمز عبور</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">رمز فعلی</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">رمز جدید</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="حداقل ۸ کاراکتر"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">تکرار رمز جدید</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--bama-dark)] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
          </button>
        </form>
      </div>
    </div>
  );
}
