/**
 * فاز ۱: امتیاز وضعیت محله بر اساس اخبار اخیر (کلمات کلیدی منفی/مثبت و دسته‌بندی)
 */

const NEGATIVE_KEYWORDS = [
  'حادثه', 'آتش‌سوزی', 'قتل', 'سرقت', 'درگیری', 'تصادف', 'جراحت', 'آسیب',
  'جرم', 'دستگیری', 'زندان', 'نزاع', 'خسارت', 'آلودگی', 'مشکل', 'اعتراض',
  'شکایت', 'تخریب', 'حادثه', 'فوت', 'مرگ', 'زخمی', 'آسیب‌دید', 'نفر',
];

const NEGATIVE_CATEGORY_SLUGS = ['nezami', 'siasi', 'mohit-zist'];

const POSITIVE_KEYWORDS = [
  'افتتاح', 'راه‌اندازی', 'بهبود', 'ساخت', 'احداث', 'برنامه', 'جشن',
  'همایش', 'مسابقه', 'کسب', 'موفق', 'پروژه', 'خدمات', 'رایگان',
];

const DAYS_LOOKBACK = 14;

export type StatusResult = { score: number; color: 'green' | 'yellow' | 'red' };

export function computeStatusFromNews(
  news: Array<{ title: string | null; summary: string | null; body: string; categories: Array<{ slug: string }> }>
): StatusResult {
  let negative = 0;
  let positive = 0;
  const text = news.map((n) => [n.title, n.summary, n.body].filter(Boolean).join(' ')).join(' ');
  const catSlugs = new Set(news.flatMap((n) => n.categories.map((c) => c.slug)));

  for (const w of NEGATIVE_KEYWORDS) {
    if (text.includes(w)) negative += 1;
  }
  for (const slug of NEGATIVE_CATEGORY_SLUGS) {
    if (catSlugs.has(slug)) negative += 2;
  }
  for (const w of POSITIVE_KEYWORDS) {
    if (text.includes(w)) positive += 1;
  }

  const total = negative + positive || 1;
  const rawScore = (positive - negative) / total;
  const score = Math.max(-1, Math.min(1, rawScore));

  let color: 'green' | 'yellow' | 'red' = 'yellow';
  if (score >= 0.2) color = 'green';
  else if (score <= -0.2) color = 'red';

  return { score, color };
}

export function getStatusUpdatedAt(updatedAt: Date | null): Date | null {
  return updatedAt;
}
