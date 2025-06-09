# تشغيل سريع لـ RxClose Backend

## الخطوات السريعة

### 1. إعداد قاعدة البيانات
```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE rxclose_db;
```

### 2. تحديث الإعدادات
في `RxCloseAPI/RxCloseAPI/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefultConnection": "Server=localhost;Database=rxclose_db;Uid=root;Pwd=YOUR_PASSWORD;"
  }
}
```

### 3. تشغيل المشروع
```bash
cd RxCloseAPI/RxCloseAPI
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

### 4. إضافة البيانات التجريبية
قم بتشغيل محتوى ملف `RxCloseAPI/RxCloseAPI/Data/SeedData.sql` في قاعدة البيانات.

## اختبار سريع
- افتح المتصفح على: `https://localhost:7000/swagger`
- جرب API: `GET /api/users`
- تسجيل دخول: `POST /api/users/login`

## بيانات تجريبية للاختبار
```json
{
  "email": "ahmed@rxclose.com",
  "password": "hashed_password_here"
}
```

**ملاحظة**: يجب استبدال `hashed_password_here` بكلمة مرور مُشفرة حقيقية. 