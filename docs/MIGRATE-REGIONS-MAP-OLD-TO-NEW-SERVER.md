# جابجایی داده‌های Iran Regions از سرور قبلی به سرور جدید

- **سرور قبلی (هاست قدیم):** 172.16.86.238 — مسیر اپ: `/var/www/regions-map-app/`
- **سرور جدید:** 193.56.118.1 — مسیر اپ: `/home/administrator/Regions-map-app/`

همهٔ داده‌های نقشه و لینک محلات داخل پوشه **uploads** (و زیرپوشه‌هایش) هستند.

---

## مرحله ۱: روی سرور قبلی (172.16.86.238) — بکاپ گرفتن

با SSH به سرور قدیم وصل شو و این دستورات را بزن:

```bash
ssh administrator@172.16.86.238
# یا هر کاربری که روی سرور قدیم داری

# مسیر اپ روی سرور قدیم (طبق راهنمای پروژه)
cd /var/www/regions-map-app

# یک آرشیو از کل پوشهٔ uploads و در صورت وجود backups
sudo tar -czvf /tmp/regions-map-data-backup.tar.gz uploads/ backups/ 2>/dev/null || sudo tar -czvf /tmp/regions-map-data-backup.tar.gz uploads/

# اگر دسترسی مستقیم به /var/www نداری، مسیر را با find پیدا کن:
# find / -name "regions-map-app" -type d 2>/dev/null
```

فایل بکاپ در **سرور قدیم** اینجاست: `/tmp/regions-map-data-backup.tar.gz`

---

## مرحله ۲: کپی کردن بکاپ به سرور جدید

یکی از این دو روش را استفاده کن.

### روش الف: کپی مستقیم از سرور قدیم به سرور جدید (با SCP روی سرور جدید)

روی **سرور جدید** (193.56.118.1) اجرا کن:

```bash
scp administrator@172.16.86.238:/tmp/regions-map-data-backup.tar.gz /home/administrator/
```

اگر از سرور قدیم با کاربر دیگری (مثلاً root) وارد می‌شوی:

```bash
scp root@172.16.86.238:/tmp/regions-map-data-backup.tar.gz /home/administrator/
```

### روش ب: از طریق کامپیوتر خودت (مک/ویندوز)

**۱) دانلود از سرور قدیم به کامپیوتر خودت:**

```bash
scp administrator@172.16.86.238:/tmp/regions-map-data-backup.tar.gz ./
```

**۲) آپلود از کامپیوتر به سرور جدید:**

```bash
scp ./regions-map-data-backup.tar.gz administrator@193.56.118.1:/home/administrator/
```

---

## مرحله ۳: روی سرور جدید (193.56.118.1) — باز کردن بکاپ

```bash
ssh administrator@193.56.118.1

cd /home/administrator/Regions-map-app

# اگر پوشه uploads از قبل وجود دارد، یک بکاپ ازش بگیر (اختیاری)
mv uploads uploads.bak.$(date +%Y%m%d) 2>/dev/null || true

# باز کردن آرشیو (فایل را با نام واقعی عوض کن)
tar -xzvf /home/administrator/regions-map-data-backup.tar.gz

# اگر داخل آرشیو فقط پوشه uploads است، الان باید uploads/ در همین مسیر باشد
# اگر ساختار آرشیو فرق دارد و مثلاً uploads داخل یک پوشهٔ دیگر است، جایش را درست کن:
# mv مسیر/uploads ./
```

ساختار نهایی روی سرور جدید باید طوری باشد که اپ بتواند مسیرهایش را پیدا کند. در کد اپ داریم:

- `PARENT_DIR = BASE_DIR.parent` → یعنی `/home/administrator/Regions-map-app`
- `UPLOAD_ROOT = PARENT_DIR / "uploads" / "uploads" / "regions"` → یعنی `/home/administrator/Regions-map-app/uploads/uploads/regions`

پس روی سرور جدید باید این مسیر وجود داشته باشد:

```
/home/administrator/Regions-map-app/uploads/uploads/regions/
├── storage/
├── history.json
├── features_index.json
├── users.json
├── links/
├── features/
├── logos/
├── neighborhood_edits/
└── businesses/
```

اگر در سرور قدیم ساختار متفاوت بود (مثلاً فقط `uploads/regions/`)، بعد از باز کردن `tar` محتوا را زیر همین مسیر بچین:

```bash
mkdir -p /home/administrator/Regions-map-app/uploads/uploads/regions
# سپس فایل‌ها و پوشه‌های استخراج‌شده را داخل uploads/uploads/regions بگذار
```

---

## مرحله ۴: دسترسی و مالکیت

```bash
cd /home/administrator/Regions-map-app
sudo chown -R administrator:administrator uploads
chmod -R 755 uploads
```

سپس سرویس اپ نقشه را یک بار ریستارت کن (مثلاً Gunicorn یا systemd):

```bash
sudo systemctl restart regions-map-app
# یا هر نام سرویسی که برای این اپ گذاشتی
```

---

## خلاصه

| مرحله | محل اجرا | کار |
|--------|----------|-----|
| ۱ | سرور قدیم 172.16.86.238 | `tar` از `uploads` (و در صورت نیاز `backups`) در `/var/www/regions-map-app` |
| ۲ | کپی فایل | `scp` از قدیم به جدید (یا قدیم → لپ‌تاپ → جدید) |
| ۳ | سرور جدید 193.56.118.1 | باز کردن `tar` در `/home/administrator/Regions-map-app` و درست کردن مسیر `uploads/uploads/regions` |
| ۴ | سرور جدید | `chown`/`chmod` و ریستارت سرویس اپ |

بعد از این کار، داده‌های نقشه و لینک محلات روی iranregions.com (سرور 193.56.118.1) باید مثل قبل در دسترس باشند.
