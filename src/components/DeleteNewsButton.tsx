'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteNewsButtonProps {
  id: string;
  title: string;
  className?: string;
}

export function DeleteNewsButton({ id, title, className }: DeleteNewsButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    const ok = window.confirm(`آیا از حذف خبر «${title}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`);
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data?.error || 'خطا در حذف خبر');
        return;
      }
      router.refresh();
    } catch {
      window.alert('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={className ?? 'text-red-600 hover:underline disabled:opacity-50'}
    >
      {loading ? 'در حال حذف...' : 'حذف'}
    </button>
  );
}
