'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-700 hover:text-[var(--bama-primary)] transition-colors"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <nav className="absolute top-full right-0 left-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="container-custom py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[var(--bama-primary)] transition-colors border-b border-gray-100 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
