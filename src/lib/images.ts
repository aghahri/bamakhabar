export const DEFAULT_NEWS_IMAGE = '/images/bamakhabar-news-placeholder.png';

/** تصویر شخص/سیاسیِ ناخواسته‌ای که حذف شده و دیگر نباید نمایش داده شود */
const UNWANTED_IMAGE_PATTERN = /agha-image\.png/i;

export function isUnwantedImage(src: string | null | undefined): boolean {
  return typeof src === 'string' && UNWANTED_IMAGE_PATTERN.test(src);
}

export function resolveNewsImage(src: string | null | undefined): string {
  if (typeof src !== 'string') return DEFAULT_NEWS_IMAGE;
  const trimmed = src.trim();
  if (!trimmed) return DEFAULT_NEWS_IMAGE;
  if (UNWANTED_IMAGE_PATTERN.test(trimmed)) return DEFAULT_NEWS_IMAGE;
  return trimmed;
}

/**
 * نرمال‌سازی imageUrl پیش از ذخیره در دیتابیس:
 * رفرنس‌های تصویر ناخواسته (agha-image.png) به placeholder برند نگاشت می‌شوند.
 * رشته‌های خالی → null تا منطق fallback در زمان نمایش اعمال شود.
 */
export function normalizeStoredImageUrl(src: string | null | undefined): string | null {
  if (typeof src !== 'string') return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (UNWANTED_IMAGE_PATTERN.test(trimmed)) return DEFAULT_NEWS_IMAGE;
  return trimmed;
}
