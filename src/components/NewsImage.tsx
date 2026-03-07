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

/** مسیرهای آپلودشده (مثلاً /uploads/...) با تگ img معمولی تا بدون خطا نمایش داده شوند */
function isLocalUpload(src: string) {
  return src.startsWith('/uploads/') || src.startsWith('/api/media/');
}

export function NewsImage({ src, alt, fill, className, sizes }: NewsImageProps) {
  const [error, setError] = useState(false);

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
        src={src}
        alt={alt}
        className={fill ? `absolute inset-0 w-full h-full ${className ?? ''}` : className}
        style={fill ? { objectFit: 'cover' } : undefined}
        sizes={sizes}
        onError={() => setError(true)}
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
