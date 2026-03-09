# راهنمای نگه‌داری دو سایت روی یک سرور (bamakhabar + Regions-map-app)

روی سرور **193.56.118.1** دو دامنه دارید:
- **bamakhabar.com** → اپلیکیشن باماخبر (Next.js)
- **iranregions.com** → اپلیکیشن نقشه محلات [Regions-map-app](https://github.com/aghahri/Regions-map-app) (Flask/Python)

---

## ۱. نصب و اجرای Regions-map-app روی سرور

```bash
# پوشهٔ مناسب (مثلاً کنار bamakhabar)
cd /home/administrator
sudo git clone https://github.com/aghahri/Regions-map-app.git
cd Regions-map-app

# طبق راهنمای خود پروژه (معمولاً Python/Flask)
# مثلاً:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt   # اگر وجود دارد

# اجرا با Gunicorn یا همان روشی که در DEPLOY_SERVER.md یا مستندات پروژه نوشته شده
# و یک سرویس systemd برای iranregions بسازید (مثلاً iranregions.service)
# که روی یک پورت دیگر گوش بدهد، مثلاً 5001
```

سرویس systemd برای Flask/Gunicorn معمولاً شبیه این است (مسیرها و نام سرویس را با واقعیت سرور تطبیق بدهید):

```ini
# /etc/systemd/system/iranregions.service
[Unit]
Description=Iran Regions Map App
After=network.target

[Service]
User=administrator
Group=administrator
WorkingDirectory=/home/administrator/Regions-map-app
Environment="PATH=/home/administrator/Regions-map-app/venv/bin"
ExecStart=/home/administrator/Regions-map-app/venv/bin/gunicorn --bind 127.0.0.1:5001 app:app
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable iranregions
sudo systemctl start iranregions
```

---

## ۲. تنظیم Nginx برای دو دامنه (دو سایت روی یک سرور)

روی همان سرور یک Nginx دارید که الان احتمالاً فقط bamakhabar را سرو می‌کند. باید برای هر دامنه یک **server block** جدا داشته باشید.

### فایل‌های کانفیگ پیشنهادی

- **bamakhabar.com**: مثلاً  
  `/etc/nginx/sites-available/bamakhabar`  
  یا  
  `/etc/nginx/conf.d/bamakhabar.conf`

- **iranregions.com**: مثلاً  
  `/etc/nginx/sites-available/iranregions`  
  یا  
  `/etc/nginx/conf.d/iranregions.conf`

### نمونه برای bamakhabar.com (Next.js روی پورت 3000)

```nginx
server {
    listen 80;
    server_name bamakhabar.com www.bamakhabar.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### نمونه برای iranregions.com (Flask/Gunicorn روی پورت 5001)

```nginx
server {
    listen 80;
    server_name iranregions.com www.iranregions.com;
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

اگر از **HTTPS** استفاده می‌کنید، برای هر دو دامنه جداگانه گواهی بگیرید (مثلاً با certbot) و یک بلوک `server { listen 443 ssl; ... }` برای هر دامنه اضافه کنید.

بعد از ویرایش:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ۳. DNS

برای هر دو دامنه در DNS رکورد **A** به IP سرور اشاره کند:

- **bamakhabar.com** و **www.bamakhabar.com** → `193.56.118.1`
- **iranregions.com** و **www.iranregions.com** → `193.56.118.1`

Nginx با `server_name` درخواست را به همان اپلیکیشن درست هدایت می‌کند.

---

## ۴. اتصال دو برنامه به هم

- **لینک از باماخبر به نقشه:** در باماخبر (مثلاً صفحه محلات یا فوتر) یک لینک به `https://iranregions.com` یا به یک مسیر خاص نقشه (مثلاً با پارامتر استان/شهر) بگذارید.
- **لینک از نقشه به باماخبر:** در Regions-map-app یک لینک به `https://bamakhabar.com` یا به صفحه اخبار یک محله خاص (اگر در باماخبر URL ثابت دارید) بگذارید.
- اگر بخواهید **داده** بین دو اپلیکیشن رد و بدل شود (مثلاً لیست محلات از باماخبر برای نقشه)، باید یا:
  - API در باماخبر (یا در نقشه) تعریف کنید و از طرف دیگر با `fetch`/درخواست HTTP صدا بزنید، یا
  - هر دو به یک دیتابیس/سرویس مشترک وصل شوند (پیشرفته‌تر).

اگر بگویید دقیقاً چه چیزی باید بین دو سایت «اتصال» داشته باشد (فقط لینک، یا داده/API)، می‌توان مرحلهٔ ۴ را دقیق‌تر نوشت.

---

## خلاصه دستورات روی سرور

```bash
# نصب Regions-map-app
cd /home/administrator
git clone https://github.com/aghahri/Regions-map-app.git
cd Regions-map-app
# نصب وابستگی‌ها و راه‌اندازی سرویس طبق مستندات خود پروژه

# کانفیگ nginx برای دو دامنه (ویرایش فایل‌های بالا)
sudo nginx -t && sudo systemctl reload nginx
```

باماخبر همان مسیر قبلی است؛ فقط مطمئن شوید در nginx فقط یک `server` برای `bamakhabar.com` دارید و یک `server` جدا برای `iranregions.com`.
