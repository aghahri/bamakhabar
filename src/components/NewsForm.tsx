'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './RichTextEditor';
import { ImageUploader } from './ImageUploader';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
}

interface NewsFormProps {
  id?: string;
  defaultTitle?: string;
  defaultSummary?: string | null;
  defaultBody?: string;
  defaultImageUrl?: string | null;
  defaultCategoryIds?: string[];
  defaultNeighborhoodId?: string | null;
  defaultPublished?: boolean;
  defaultFeatured?: boolean;
}

export function NewsForm({
  id,
  defaultTitle = '',
  defaultSummary = '',
  defaultBody = '',
  defaultImageUrl = '',
  defaultCategoryIds = [],
  defaultNeighborhoodId = '',
  defaultPublished = false,
  defaultFeatured = false,
}: NewsFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [title, setTitle] = useState(defaultTitle);
  const [summary, setSummary] = useState(defaultSummary ?? '');
  const [body, setBody] = useState(defaultBody);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl ?? '');
  const [categoryIds, setCategoryIds] = useState<string[]>(defaultCategoryIds);
  const [neighborhoodId, setNeighborhoodId] = useState(defaultNeighborhoodId ?? '');
  const [published, setPublished] = useState(defaultPublished);
  const [featured, setFeatured] = useState(defaultFeatured);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
    fetch('/api/neighborhoods')
      .then((r) => r.json())
      .then(setNeighborhoods);
  }, []);

  useEffect(() => {
    setTitle(defaultTitle);
    setSummary(defaultSummary ?? '');
    setBody(defaultBody);
    setImageUrl(defaultImageUrl ?? '');
    setCategoryIds(defaultCategoryIds);
    setNeighborhoodId(defaultNeighborhoodId ?? '');
    setPublished(defaultPublished);
    setFeatured(defaultFeatured);
  }, [
    defaultTitle,
    defaultSummary,
    defaultBody,
    defaultImageUrl,
    defaultCategoryIds,
    defaultNeighborhoodId,
    defaultPublished,
    defaultFeatured,
  ]);

  function toggleCategory(catId: string) {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (categoryIds.length === 0) {
      setError('حداقل یک دسته‌بندی انتخاب کنید');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        summary: summary || null,
        body,
        imageUrl: imageUrl || null,
        categoryIds,
        neighborhoodId: neighborhoodId || null,
        published,
        featured,
      };
      const url = id ? `/api/news/${id}` : '/api/news';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطا در ذخیره');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">خلاصه (اختیاری)</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">متن خبر *</label>
        <RichTextEditor content={body} onChange={setBody} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">تصویر اصلی (اختیاری)</label>
        <ImageUploader value={imageUrl} onChange={setImageUrl} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی‌ها *</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                categoryIds.includes(c.id)
                  ? 'bg-[var(--bama-primary)] text-white border-[var(--bama-primary)]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">محله (اختیاری)</label>
        <select
          value={neighborhoodId}
          onChange={(e) => setNeighborhoodId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">بدون محله</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span className="text-sm">منتشر شود</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span className="text-sm">نمایش در اسلایدر صفحه اول (خبر مهم)</span>
        </label>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'در حال ذخیره...' : id ? 'بروزرسانی' : 'ذخیره خبر'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
