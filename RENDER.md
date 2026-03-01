# راهنمای دیپلوی باماخبر روی Render

از اول با این مشخصات سرویس را بسازید.

---

## روش ۱: با Blueprint (خودکار)

۱. در [dashboard.render.com](https://dashboard.render.com) برو **New** → **Blueprint**.
۲. ریپازیتوری گیت‌هاب باماخبر را وصل کن.
۳. رندر فایل `render.yaml` را می‌خواند و یک **Web Service** و یک **PostgreSQL** می‌سازد و به هم وصل می‌کند.
۴. **Apply** بزن و صبر کن تا Build و Deploy تمام شود.

---

## روش ۲: دستی (دو سرویس جدا)

### مرحله ۱: دیتابیس PostgreSQL

۱. **New** → **PostgreSQL**.
۲. نام: `bamakhabar-db` (یا هر نام).
۳. **Region**: مثلاً Frankfurt.
۴. **Plan**: Free.
۵. **Create Database**. بعد از ساخت، برو **Info** و مقدار **Internal Database URL** را کپی کن (برای مرحله بعد).

---

### مرحله ۲: Web Service (سایت)

۱. **New** → **Web Service**.
۲. ریپازیتوری گیت‌هاب باماخبر را وصل کن.
۳. این مقادیر را دقیقاً وارد کن:

| فیلد | مقدار |
|------|--------|
| **Name** | `bamakhabar` |
| **Region** | مثلاً Frankfurt (همان منطقه دیتابیس) |
| **Branch** | `main` |
| **Runtime** | **Node** |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push && npm run db:seed && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

۴. بخش **Environment** → **Add Environment Variable**:
   - **Key**: `DATABASE_URL`
   - **Value**: همان **Internal Database URL** که از مرحله ۱ کپی کردی (یا اگر دیتابیس را به سرویس لینک کردی، از **Add from Render** انتخاب کن).

۵. **Create Web Service**.

---

## بعد از اولین دیپلوی

- آدرس سایت: `https://bamakhabar.onrender.com` (یا همان که رندر داده).
- پنل ادمین: `https://YOUR-URL.onrender.com/admin`
- ورود ادمین: نام کاربری `admin`، رمز `admin123` (حتماً بعداً عوض کن).

---

## اگر خطا گرفتی

- **Build failed**: در لاگ ببین خطا از کدام مرحله است (install / prisma / build). معمولاً به‌خاطر نبودن `DATABASE_URL` یا اشتباه بودن آن است.
- **Application failed to start**: مطمئن شو **Start Command** دقیقاً `npm start` است و **Runtime** روی **Node** است نه Python.
