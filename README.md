# باماخبر | Bamakhabar

پایگاه خبری اخبار محلات کشور — **bamakhabar.com**

سایت خبری با پنل ادمین برای انتشار اخبار محلات، شبیه عصر ایران و تابناک.

## امکانات

- **صفحه اصلی**: خبر شاخص + آخرین اخبار
- **دسته‌بندی**: اخبار اجتماعی، فرهنگی، ورزشی، اقتصاد، محیط زیست
- **محلات**: اختصاص خبر به محله/شهر
- **پنل ادمین**: ورود، افزودن/ویرایش/حذف خبر، انتخاب دسته و محله، انتشار و خبر شاخص

## پیش‌نیاز

- Node.js 18+
- npm

## نصب و اجرا

```bash
cd bamakhabar
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

سایت: **http://localhost:3000**  
پنل ادمین: **http://localhost:3000/admin**

### ورود ادمین (پس از seed)

- **نام کاربری:** `admin`
- **رمز عبور:** `admin123`

حتماً پس از اولین ورود رمز را در دیتابیس تغییر دهید.

## ساختار پروژه

- `src/app/` — صفحات Next.js (App Router)
- `src/app/admin/` — پنل ادمین و فرم خبر
- `src/app/api/` — API ورود و CRUD اخبار
- `src/components/` — هدر، فوتر، کارت خبر، فرم
- `prisma/` — اسکیما و seed دیتابیس (SQLite)

## دیتابیس

پیش‌فرض: SQLite (`prisma/dev.db`). برای production می‌توانید در `prisma/schema.prisma` به PostgreSQL یا MySQL تغییر دهید و `DATABASE_URL` را تنظیم کنید.

## دامنه

برای استفاده با **bamakhabar.com** در production متغیر `NEXT_PUBLIC_SITE_URL` یا تنظیمات دامنه در هاست را روی `https://bamakhabar.com` قرار دهید.

---

## انتشار در گیت‌هاب

۱. در ترمینال داخل پوشه پروژه:

```bash
cd /Users/akiokaviano/bamakhabar
git init
git add .
git commit -m "Initial commit: سایت خبری باماخبر"
git branch -M main
```

۲. در [github.com/new](https://github.com/new) یک ریپازیتوری جدید بسازید (مثلاً اسمش را `bamakhabar` بگذارید). گزینه «Add a README» را تیک نزنید.

۳. بعد از ساخت ریپو، آدرس آن را (مثل `https://github.com/USERNAME/bamakhabar.git`) در دستور زیر جایگزین کنید و اجرا کنید:

```bash
git remote add origin https://github.com/USERNAME/bamakhabar.git
git push -u origin main
```

از این به بعد با `git add .` و `git commit` و `git push` تغییرات را به گیت‌هاب بفرستید.
