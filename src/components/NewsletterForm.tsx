'use client';

import { useState, useEffect } from 'react';

type Neighborhood = { id: string; name: string; city: string | null; province: string | null };

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [neighborhoodIds, setNeighborhoodIds] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/neighborhoods')
      .then((r) => r.json())
      .then((list: Neighborhood[]) => setNeighborhoods(list))
      .catch(() => setNeighborhoods([]));
  }, []);

  function toggleNeighborhood(id: string) {
    setNeighborhoodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), neighborhoodIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'خطا در ثبت نام' });
        return;
      }
      setMessage({ type: 'success', text: data.message || 'ثبت نام انجام شد.' });
      setEmail('');
      setNeighborhoodIds([]);
    } catch {
      setMessage({ type: 'error', text: 'خطای اتصال به سرور' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h4 className="font-semibold text-white mb-3">خبرنامه محلات</h4>
      <p className="text-sm text-gray-400 mb-3">
        با ثبت ایمیل و انتخاب محلات، هنگام انتشار خبر جدید در آن محلات ایمیل دریافت کنید.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل شما"
          required
          className="w-full px-3 py-2 rounded border border-gray-600 bg-gray-800/50 text-white placeholder-gray-500 focus:ring-1 focus:ring-[var(--bama-primary)]"
        />
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-400 hover:text-white">
            انتخاب محلات ({neighborhoodIds.length} انتخاب شده)
          </summary>
          <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
            {neighborhoods.slice(0, 80).map((n) => (
              <label key={n.id} className="flex items-center gap-2 cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={neighborhoodIds.includes(n.id)}
                  onChange={() => toggleNeighborhood(n.id)}
                  className="rounded"
                />
                <span>{n.name}{n.city ? `، ${n.city}` : ''}</span>
              </label>
            ))}
            {neighborhoods.length > 80 && (
              <p className="text-xs text-gray-500">۸۰ محله اول نمایش داده شده است.</p>
            )}
          </div>
        </details>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-[var(--bama-primary)] text-white rounded font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'در حال ثبت...' : 'ثبت نام در خبرنامه'}
        </button>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
