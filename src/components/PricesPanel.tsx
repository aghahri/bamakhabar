'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function formatPrice(n: number, decimals = 2): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatNum(n: number): string {
  return n.toLocaleString('fa-IR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function PricesPanel() {
  const [data, setData] = useState<{ oil: Array<{ name: string; price: number; change_24h: number | null }>; crypto: Array<{ name: string; price: number; change24h: number }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices');
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPrices();
    const t = setInterval(fetchPrices, 120000); // هر ۲ دقیقه
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-2 mb-3">
          قیمت لحظه‌ای
        </h3>
        <p className="text-sm text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-2 mb-3">
          قیمت لحظه‌ای
        </h3>
        <p className="text-sm text-gray-500">امکان بارگذاری قیمت‌ها نبود.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-bold text-gray-800 border-r-4 border-[var(--bama-primary)] pr-2 mb-3">
        قیمت لحظه‌ای
      </h3>

      {data?.oil && data.oil.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">نفت و طلا و گاز</h4>
          <ul className="space-y-1.5 text-sm">
            {data.oil.map((item) => (
              <li key={item.name} className="flex justify-between items-center">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium">
                  {formatNum(item.price)} $
                  {item.change_24h != null && (
                    <span
                      className={`mr-1 text-xs ${item.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      ({item.change_24h >= 0 ? '+' : ''}{item.change_24h.toFixed(2)}%)
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data?.crypto && data.crypto.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">ارز دیجیتال</h4>
          <ul className="space-y-1.5 text-sm">
            {data.crypto.map((item) => (
              <li key={item.name} className="flex justify-between items-center">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium">
                  {formatPrice(item.price)} $
                  <span
                    className={`mr-1 text-xs ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    ({item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
        <Link
          href="https://www.tsetmc.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--bama-primary)] hover:underline block"
        >
          شاخص بورس تهران (tsetmc)
        </Link>
        <Link
          href="https://www.tradingview.com/markets/indices/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--bama-primary)] hover:underline block"
        >
          شاخص‌های جهانی
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        به‌روزرسانی هر ۲ دقیقه
      </p>
    </div>
  );
}
