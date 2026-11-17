# راهنمای استقرار روی سرور

سایت در **یک کانتینر داکر** اجرا می‌شود (Next.js + SQLite). nginx با TLS جلوی آن قرار می‌گیرد. همهٔ داده‌های ماندگار در یک volume به نام `/data` هستند.

## ۱. پیش‌نیازهای سرور

- لینوکس (Ubuntu 22.04/24.04 یا Debian 12) با حداقل **۲ گیگابایت RAM** برای ساخت image. اجرای سایت به حدود ۳۰۰ مگابایت نیاز دارد.
- Docker Engine با افزونهٔ Compose (`docker compose version`)
- git، nginx و certbot

```bash
sudo apt-get update && sudo apt-get install -y git nginx certbot python3-certbot-nginx
```

برای نصب Docker راهنمای رسمی docs.docker.com را دنبال کنید.

> **سرورهای داخل ایران:** هنگام ساخت image، داکر باید از Docker Hub و npm دانلود کند و ممکن است این دسترسی‌ها مسدود باشند. دو راه دارید:
> - یک registry mirror در `/etc/docker/daemon.json` تنظیم کنید.
> - image را روی سیستم دیگری بسازید و منتقل کنید (بخش ۸).

## ۲. دریافت کد

```bash
git clone https://github.com/dash000meyti/sabano.git
```

```bash
cd sabano
```

## ۳. تنظیم `.env`

```bash
cp .env.example .env
```

```bash
openssl rand -hex 32
```

خروجی دستور بالا را در `.env` به‌عنوان `SESSION_SECRET` بگذارید. سپس این مقادیر را تنظیم کنید:

| متغیر | توضیح |
|---|---|
| `SITE_URL` | نشانی نهایی سایت، مثلاً `https://sabano.ir` (بدون `/` در انتها). در canonical، sitemap و JSON-LD استفاده می‌شود. |
| `SESSION_SECRET` | رشتهٔ تصادفی بالا. اگر خالی بماند یا مقدار نمونه باشد، سرور یک مقدار تصادفی می‌سازد و در `/data/session-secret` نگه می‌دارد. با این حال بهتر است مقدار خودتان را بگذارید. |
| `ADMIN_EMAIL` و `ADMIN_PASSWORD` | اولین مدیر پنل. فقط وقتی ساخته می‌شود که هنوز هیچ کاربری وجود ندارد. رمز باید حداقل ۱۲ کاراکتر باشد. مقدار نمونه پذیرفته نمی‌شود. |
| `SMTP_*` و `NOTIFY_EMAIL` | اختیاری: ارسال ایمیل برای درخواست‌های جدید فرم همکاری |
| `INDEXNOW_KEY` | اختیاری: اطلاع‌رسانی فوری تغییرات به Bing و Yandex |
| `GOOGLE_SITE_VERIFICATION` و `BING_SITE_VERIFICATION` و `YANDEX_VERIFICATION` | اختیاری: کد تأیید مالکیت در کنسول جست‌وجو |

پس از اولین ورود به پنل، می‌توانید `ADMIN_PASSWORD` را از `.env` پاک کنید. کاربران بعدی از بخش «کاربران» در پنل ساخته می‌شوند.

## ۴. ساخت و اجرا

```bash
docker compose up -d --build
```

```bash
docker compose logs -f web
```

```bash
curl -s http://127.0.0.1:3000/api/health
```

در اولین اجرا این کارها خودکار انجام می‌شود:
- migrationها اعمال می‌شوند.
- دیتابیس خالی با محتوای فعلی سایت پر می‌شود.
- اولین مدیر از `.env` ساخته می‌شود.
- پشتیبان‌گیری روزانه زمان‌بندی می‌شود.

کانتینر فقط روی `127.0.0.1:3000` گوش می‌دهد و مستقیم از اینترنت در دسترس نیست.

پس از هر استقرار، بار اول که هر تصویر در هر اندازه درخواست می‌شود، سرور نسخهٔ AVIF/WebP آن را می‌سازد و ذخیره می‌کند. برای همین چند بازدید اول کمی کندتر است. این فقط روی تصاویر اثر دارد و متن صفحه بی‌درنگ نمایش داده می‌شود.

## ۵. nginx و HTTPS

فایل `/etc/nginx/sites-available/sabano`:

```nginx
server {
  listen 80;
  server_name sabano.ir www.sabano.ir;

  client_max_body_size 10m;   # پیوست فرم همکاری تا ۸ مگابایت

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sabano /etc/nginx/sites-enabled/sabano
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

```bash
sudo certbot --nginx -d sabano.ir -d www.sabano.ir
```

> **سرآیندهای `X-Real-IP` و `X-Forwarded-For` لازم‌اند.** محدودیت تعداد ارسال فرم و تلاش‌های ورود بر اساس IP واقعی بازدیدکننده کار می‌کند. اپ این IP را از `X-Real-IP` می‌خواند، یا از آخرین مقداری که nginx به `X-Forwarded-For` اضافه کرده است.

نشانی‌های قدیمی سایت (مثل `/about.html` و `/en/services.html`) خودکار با ریدایرکت دائمی به صفحه‌های جدید هدایت می‌شوند. پس از جابه‌جایی دامنه، در Google Search Console نقشهٔ سایت `https://sabano.ir/sitemap.xml` را ثبت کنید.

## ۶. به‌روزرسانی

```bash
git pull
```

```bash
docker compose up -d --build
```

داده‌ها در volume می‌مانند و migrationهای جدید هنگام راه‌اندازی خودکار اعمال می‌شوند.

## ۷. پشتیبان‌گیری و بازیابی

- کانتینر هر روز یک نسخه از دیتابیس را در `/data/backups` نگه می‌دارد (۱۴ نسخهٔ آخر). از «پنل ← پشتیبان و سیستم» هم می‌توانید نسخهٔ پشتیبان بگیرید یا دانلود کنید.
- پیوست‌های فرم (`uploads/`) و تصاویر پنل (`media/`) هم در همان volume هستند. یک نسخهٔ کامل بیرون از سرور نگه دارید. پیش از آن، از «پنل ← پشتیبان و سیستم ← پشتیبان‌گیری اکنون» یک نسخهٔ سازگار از دیتابیس بگیرید. این نسخه در پوشهٔ `backups/` و در نتیجه داخل همین فایل قرار می‌گیرد.

```bash
docker compose exec -T web tar czf - -C /data . > sabano-data-$(date +%F).tgz
```

بازیابی از یک نسخهٔ کامل:

```bash
docker compose stop web
```

```bash
docker compose run --rm -T --no-deps --entrypoint sh web -c "rm -rf /data/* && tar xzf - -C /data" < sabano-data-2026-01-01.tgz
```

```bash
docker compose start web
```

## ۸. ساخت image روی سیستم دیگر (اختیاری)

اگر سرور به اینترنت آزاد دسترسی ندارد یا RAM کافی برای ساخت ندارد:

```bash
docker build -t sabano-web:latest --build-arg SITE_URL=https://sabano.ir .
```

```bash
docker save sabano-web:latest | gzip > sabano-web.tar.gz
```

فایل را به سرور منتقل کنید، سپس روی سرور:

```bash
gunzip -c sabano-web.tar.gz | docker load
```

```bash
docker compose up -d --no-build
```

## ۹. عیب‌یابی

| نشانه | بررسی |
|---|---|
| پنل «نام کاربری یا رمز اشتباه» می‌دهد و هیچ مدیری ساخته نشده | لاگ را ببینید. اگر پیام «ADMIN_PASSWORD is a placeholder» آمده، رمز قوی‌تری بگذارید و `docker compose up -d` بزنید. |
| هشدار `SESSION_SECRET is missing` در لاگ | مقدار تصادفی بخش ۳ را تنظیم و کانتینر را دوباره اجرا کنید. |
| خطای 413 هنگام ارسال فرم با پیوست | `client_max_body_size 10m` در nginx |
| همهٔ بازدیدکننده‌ها با هم به محدودیت تعداد درخواست می‌خورند | سرآیندهای `X-Real-IP` و `X-Forwarded-For` در nginx تنظیم نشده‌اند و همه با IP خود nginx دیده می‌شوند. |
| canonical یا sitemap دامنهٔ اشتباه دارد | `SITE_URL` را در `.env` اصلاح کنید و image را دوباره بسازید (`--build`). |
