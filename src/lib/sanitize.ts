import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption',
  'div', 'span',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
  'class', 'style', 'dir',
];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

export function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

function toAbsoluteMediaUrl(html: string): string {
  if (!BASE_URL) return html;
  return html.replace(
    /\s(src|href)=["'](\/uploads\/[^"']+)["']/g,
    (_, attr, path) => ` ${attr}="${BASE_URL}${path}"`
  );
}

export function renderBody(body: string): string {
  let out: string;
  if (isHtmlContent(body)) {
    out = sanitizeHtml(body);
    out = toAbsoluteMediaUrl(out);
  } else {
    out = body
      .split(/\n\n+/)
      .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
      .join('');
  }
  return out;
}
