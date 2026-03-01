import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[var(--bama-dark)] text-gray-300 mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-xl font-bold text-white">
              باماخبر
            </Link>
            <p className="mt-2 text-sm">
              پایگاه خبری اخبار محلات کشور - bamakhabar.com
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">صفحه اصلی</Link></li>
              <li><Link href="/category/ejtemaei" className="hover:text-white">اجتماعی</Link></li>
              <li><Link href="/category/farhangi" className="hover:text-white">فرهنگی</Link></li>
              <li><Link href="/category/varzeshi" className="hover:text-white">ورزشی</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">تماس با ما</h4>
            <p className="text-sm">info@bamakhabar.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} باماخبر. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
