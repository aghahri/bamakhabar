# راهنمای نصب باماخبر روی لینوکس

## پیش‌نیازها

### 1. نصب Node.js (نسخه 20 یا بالاتر)

```bash
# نصب از طریق NodeSource (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# بررسی نسخه
node -v   # باید v20.x.x باشد
npm -v
```

برای توزیع‌های دیگر:

```bash
# Fedora/RHEL/CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Arch Linux
sudo pacman -S nodejs npm
```

### 2. نصب PostgreSQL

**Ubuntu/Debian** (پس از نصب، سرویس خودکار شروع می‌شود):

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

**Fedora/RHEL/CentOS:**

```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb    # فقط Fedora/RHEL - روی Ubuntu اجرا نکنید
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

بررسی اجرا بودن سرویس:

```bash
sudo systemctl status postgresql
```

### 3. نصب Git

```bash
sudo apt-get install -y git    # Ubuntu/Debian
sudo dnf install -y git        # Fedora/RHEL
```

---

## مراحل نصب

### مرحله ۱: کلون پروژه

```bash
git clone https://github.com/YOUR_USERNAME/bamakhabar.git
cd bamakhabar
```

### مرحله ۲: نصب وابستگی‌ها

```bash
npm install
```

### مرحله ۳: ساخت دیتابیس PostgreSQL

```bash
# وارد شدن به شل PostgreSQL
sudo -u postgres psql

# اجرای دستورات SQL زیر:
CREATE USER bamakhabar WITH PASSWORD 'your_strong_password';
CREATE DATABASE bamakhabar OWNER bamakhabar;
GRANT ALL PRIVILEGES ON DATABASE bamakhabar TO bamakhabar;
\q
```

### مرحله ۴: تنظیم فایل محیطی (.env)

```bash
cp .env.example .env
```

فایل `.env` را ویرایش کنید:

```bash
nano .env
```

محتوای فایل:

```env
DATABASE_URL="postgresql://bamakhabar:your_strong_password@localhost:5432/bamakhabar"
```

> **مهم:** مقدار `your_strong_password` را با رمز عبوری که در مرحله قبل تنظیم کردید جایگزین کنید.
>
> **نکته:** اگر رمز عبور شامل کاراکترهای خاص باشد، باید آن‌ها را URL-encode کنید:
>
> | کاراکتر | کد |
> |---|---|
> | `!` | `%21` |
> | `@` | `%40` |
> | `#` | `%23` |
> | `$` | `%24` |
> | `%` | `%25` |
> | `^` | `%5E` |
> | `&` | `%26` |
>
> مثال: رمز `a_A123456!@#` → `a_A123456%21%40%23`

### مرحله ۵: راه‌اندازی دیتابیس و Prisma

```bash
# تولید Prisma Client
npx prisma generate

# ایجاد جداول در دیتابیس
npx prisma db push

# پر کردن دیتابیس با داده‌های اولیه (دسته‌بندی‌ها، محله‌ها، اخبار نمونه)
npx prisma db seed
```

### مرحله ۶: بیلد پروژه

```bash
npm run build
```

### مرحله ۷: اجرا

```bash
# حالت پروداکشن (پورت 3000)
npm start

# یا حالت توسعه (با hot-reload)
npm run dev
```

سایت در آدرس `http://localhost:3000` قابل دسترسی است.

---

## پنل مدیریت

پس از seed شدن دیتابیس، با اطلاعات زیر وارد پنل مدیریت شوید:

- **آدرس:** `http://localhost:3000/admin/login`
- **نام کاربری:** `admin`
- **رمز عبور:** `admin123`

> **هشدار امنیتی:** حتماً رمز عبور پیش‌فرض را پس از اولین ورود تغییر دهید.

---

## اجرا با Systemd (سرویس دائمی)

برای اینکه سایت به صورت خودکار اجرا شود و پس از ریستارت سرور دوباره بالا بیاید:

```bash
sudo nano /etc/systemd/system/bamakhabar.service
```

محتوای فایل:

```ini
[Unit]
Description=BaMaKhabar Next.js App
After=network.target postgresql.service

[Service]
Type=simple
User=YOUR_LINUX_USER
WorkingDirectory=/path/to/bamakhabar
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/path/to/bamakhabar/.env

[Install]
WantedBy=multi-user.target
```

سپس:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bamakhabar
sudo systemctl start bamakhabar

# بررسی وضعیت
sudo systemctl status bamakhabar
```

---

## تنظیم Nginx (Reverse Proxy) - اختیاری

برای دسترسی از طریق دامنه و پورت 80/443:

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/bamakhabar
```

محتوای فایل:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

فعال‌سازی:

```bash
sudo ln -s /etc/nginx/sites-available/bamakhabar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## فعال‌سازی HTTPS با Let's Encrypt - اختیاری

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## خلاصه سریع (Quick Start)

```bash
git clone https://github.com/YOUR_USERNAME/bamakhabar.git
cd bamakhabar
npm install
cp .env.example .env
# ویرایش .env و تنظیم DATABASE_URL
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build
npm start
```

---

## عیب‌یابی

| مشکل | راه‌حل |
|---|---|
| خطای اتصال به دیتابیس | بررسی `DATABASE_URL` در `.env` و اجرا بودن PostgreSQL |
| پورت 3000 اشغال است | `lsof -i :3000` و سپس `kill` پروسه یا تغییر پورت با `PORT=3001 npm start` |
| خطای Prisma | اجرای مجدد `npx prisma generate && npx prisma db push` |
| خطای permission | بررسی دسترسی کاربر PostgreSQL و فایل‌های پروژه |
