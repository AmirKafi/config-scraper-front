# تنظیم Supabase برای پروژه

## مراحل نصب:

### 1. حساب Supabase ایجاد کنید
- به [supabase.com](https://supabase.com) بروید
- ثبت‌نام کنید یا وارد شوید

### 2. یک پروژه جدید ایجاد کنید
- روی "New Project" کلیک کنید
- یک نام و رمزعبور مشخص کنید
- منطقه را انتخاب کنید

### 3. جدول ایجاد کنید
در Supabase Dashboard > SQL Editor، این SQL را اجرا کنید:

```sql
CREATE TABLE configs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ping REAL NOT NULL,
  config TEXT NOT NULL,
  channel TEXT NOT NULL,
  protocol TEXT NOT NULL,
  tested_at TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. API Keys را کپی کنید
- به Settings > API > Project API Keys بروید
- `Project URL` را کپی کنید و به `.env.local` اضافه کنید
- `anon public` key را کپی کنید

### 5. .env.local را تکمیل کنید

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. پروژه را شروع کنید

```bash
pnpm dev
```

## Row Level Security (اختیاری اما توصیه می‌شود)

اگر می‌خواهید سطح امان بیشتری داشته باشید، RLS را فعال کنید:

1. در Supabase Dashboard، روی جدول `configs` کلیک کنید
2. `Authentication > Policies` را انتخاب کنید
3. یک policy به نام "Allow all read" اضافه کنید:

```sql
CREATE POLICY "Allow all select" ON configs
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON configs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON configs
FOR DELETE USING (auth.role() = 'authenticated');
```

## تست API

### POST - درج داده‌ها:
```bash
curl -X POST http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '[
    {
      "ping": 45,
      "config": "vpn-config-1",
      "channel": "telegram",
      "protocol": "ss"
    }
  ]'
```

### GET - دریافت داده‌ها:
```bash
curl http://localhost:3000/api/configs
```
