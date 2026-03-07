'use client';

import Image from 'next/image';
import { useState } from 'react';

interface NewsImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

/** مسیرهای آپلودشده را از طریق API مدیا سرو می‌کنیم تا روی همه هاست‌ها درست کار کند */
function getImageSrc(src: string): string {
  if (!src) return src;
  if (src.startsWith('/uploads/')) return `/api/media${src}`;
  if (src.startsWith('/api/media/')) return src;
  return src;
}

function isLocalUpload(src: string) {
  return src.startsWith('/uploads/') || src.startsWith('/api/media/');
}

export function NewsImage({ src, alt, fill, className, sizes }: NewsImageProps) {
  const [error, setError] = useState(false);
  const imageSrc = getImageSrc(src);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-400 ${fill ? 'absolute inset-0' : ''} ${className ?? ''}`}
      >
        <span className="text-4xl" aria-hidden>📰</span>
      </div>
    );
  }

  if (isLocalUpload(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={alt}
        className={fill ? `absolute inset-0 w-full h-full ${className ?? ''}` : className}
        style={fill ? { objectFit: 'cover' } : undefined}
        sizes={sizes}
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={() => setError(true)}
    />
  );
}
