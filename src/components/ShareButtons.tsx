'use client';

import { useEffect, useState } from 'react';

interface ShareButtonsProps {
  title: string;
  /** آدرس مطلق پشتیبان برای رندر اولیه/SSR؛ در مرورگر با آدرس واقعی صفحه جایگزین می‌شود */
  url: string;
}

const BTN =
  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-gray-300 ' +
  'bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors';

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState(url);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
      setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    }
  }, []);

  async function copyLink(key: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      /* بی‌صدا؛ کاربر می‌تواند دستی کپی کند */
    }
  }

  async function webShare() {
    try {
      await navigator.share({ title, text: title, url: shareUrl });
    } catch {
      /* کاربر لغو کرد یا پشتیبانی نشد */
    }
  }

  function openExternal(href: string) {
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  const enc = encodeURIComponent;
  const telegramHref = `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(title)}`;
  const whatsappHref = `https://wa.me/?text=${enc(`${title} ${shareUrl}`)}`;

  return (
    <div dir="rtl" className="mt-8 pt-6 border-t border-gray-100">
      <h2 className="text-sm font-bold text-gray-700 mb-3">اشتراک‌گذاری این خبر</h2>
      <div className="flex flex-wrap gap-2">
        {canShare && (
          <button
            type="button"
            onClick={webShare}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-[var(--bama-primary)] text-white hover:opacity-90 transition-opacity"
          >
            اشتراک‌گذاری
          </button>
        )}
        <button type="button" onClick={() => openExternal(telegramHref)} className={BTN}>
          تلگرام
        </button>
        <button type="button" onClick={() => openExternal(whatsappHref)} className={BTN}>
          واتساپ
        </button>
        <button type="button" onClick={() => copyLink('bale')} className={BTN}>
          {copied === 'bale' ? 'لینک کپی شد ✓' : 'بله'}
        </button>
        <button type="button" onClick={() => copyLink('tootnet')} className={BTN}>
          {copied === 'tootnet' ? 'لینک کپی شد ✓' : 'توت‌نت'}
        </button>
        <button type="button" onClick={() => copyLink('copy')} className={BTN}>
          {copied === 'copy' ? 'کپی شد ✓' : 'کپی لینک'}
        </button>
      </div>
    </div>
  );
}
