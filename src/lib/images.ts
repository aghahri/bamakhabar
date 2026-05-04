export const DEFAULT_NEWS_IMAGE = '/images/bamakhabar-news-placeholder.png';

export function resolveNewsImage(src: string | null | undefined): string {
  if (typeof src !== 'string') return DEFAULT_NEWS_IMAGE;
  const trimmed = src.trim();
  if (!trimmed) return DEFAULT_NEWS_IMAGE;
  return trimmed;
}
