'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'NEEDS_REVISION';

interface Props {
  id: string;
  status: ReviewStatus;
}

export function ReviewActions({ id, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'APPROVE' | 'NEEDS_REVISION' | null>(null);

  async function run(action: 'APPROVE' | 'NEEDS_REVISION') {
    if (loading) return;
    setLoading(action);
    try {
      const res = await fetch(`/api/news/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data?.error || 'خطا در ثبت وضعیت');
        return;
      }
      router.refresh();
    } catch {
      window.alert('خطای اتصال به سرور');
    } finally {
      setLoading(null);
    }
  }

  return (
    <span className="inline-flex gap-3">
      {status !== 'APPROVED' && (
        <button
          type="button"
          onClick={() => run('APPROVE')}
          disabled={loading !== null}
          className="text-green-700 hover:underline disabled:opacity-50"
        >
          {loading === 'APPROVE' ? '...' : 'تایید'}
        </button>
      )}
      {status !== 'NEEDS_REVISION' && (
        <button
          type="button"
          onClick={() => run('NEEDS_REVISION')}
          disabled={loading !== null}
          className="text-amber-700 hover:underline disabled:opacity-50"
        >
          {loading === 'NEEDS_REVISION' ? '...' : 'نیاز به اصلاح'}
        </button>
      )}
    </span>
  );
}
