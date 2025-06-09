# RxClose API - Backend

## نظرة عامة
هذا هو الـ Backend الخاص بتطبيق RxClose، وهو نظام إدارة الصيدليات والأدوية.

## المتطلبات
- .NET 8.0 SDK
- MySQL Server
- Visual Studio أو Visual Studio Code

## إعداد قاعدة البيانات

### 1. إنشاء قاعدة البيانات
```sql
CREATE DATABASE rxclose_db;
```

### 2. تحديث connection string
في ملف `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefultConnection": "Server=localhost;Database=rxclose_db;Uid=root;Pwd=your_password;"
  }
}
```

### 3. إجراء Migration
```bash
# الانتقال إلى مجلد المشروع
cd RxCloseAPI/RxCloseAPI

# إضافة migration جديد
dotnet ef migrations add InitialCreate

# تطبيق Migration على قاعدة البيانات
dotnet ef database update
```

### 4. إضافة البيانات التجريبية
قم بتشغيل الـ SQL الموجود في ملف `RxCloseAPI/RxCloseAPI/Data/SeedData.sql` على قاعدة البيانات.

## تشغيل المشروع

```bash
# الانتقال إلى مجلد المشروع
cd RxCloseAPI/RxCloseAPI

# استعادة الحزم
dotnet restore

# تشغيل المشروع
dotnet run
```

سيعمل الـ API على: `https://localhost:7000` أو `http://localhost:5000`

## الـ APIs المتاحة

### المستخدمين (Users)
- `GET /api/users` - جلب جميع المستخدمين
- `GET /api/users/{id}` - جلب مستخدم محدد
- `POST /api/users` - إضافة مستخدم جديد
- `PUT /api/users/{id}` - تحديث مستخدم
- `DELETE /api/users/{id}` - حذف مستخدم
- `POST /api/users/login` - تسجيل الدخول
- `PUT /api/users/{id}/role` - تحديث دور المستخدم

### الصيدليات (Pharmacies)
- `GET /api/pharmacy` - جلب جميع الصيدليات
- `GET /api/pharmacy/{id}` - جلب صيدلية محددة
- `POST /api/pharmacy` - إضافة صيدلية جديدة
- `PUT /api/pharmacy/{id}` - تحديث صيدلية
- `DELETE /api/pharmacy/{id}` - حذف صيدلية
- `PUT /api/pharmacy/{id}/status` - تحديث حالة الصيدلية
- `PUT /api/pharmacy/{id}/verify` - التحقق من الصيدلية
- `GET /api/pharmacy/statistics` - إحصائيات الصيدليات

### المنتجات (Products)
- `GET /api/product` - جلب جميع المنتجات
- `GET /api/product/{id}` - جلب منتج محدد
- `GET /api/product/pharmacy/{pharmacyId}` - جلب منتجات صيدلية محددة
- `POST /api/product` - إضافة منتج جديد
- `PUT /api/product/{id}` - تحديث منتج
- `DELETE /api/product/{id}` - حذف منتج
- `GET /api/product/statistics` - إحصائيات المنتجات
- `GET /api/product/categories` - جلب الفئات
- `GET /api/product/search?query=` - البحث في المنتجات

### لوحة التحكم (Dashboard)
- `GET /api/dashboard/statistics` - الإحصائيات العامة
- `GET /api/dashboard/charts/revenue` - بيانات الإيرادات
- `GET /api/dashboard/charts/orders` - بيانات الطلبات
- `GET /api/dashboard/charts/products` - بيانات المنتجات

## البيانات التجريبية

### المستخدمين
- **Super Admin**: ahmed@rxclose.com
- **Pharmacy Admins**: fatma@pharmacy1.com, mohamed@pharmacy2.com
- **Users**: sara@user.com, ali@user.com

### الصيدليات
- صيدلية النور (القاهرة)
- صيدلية الشفاء (الإسكندرية)
- صيدلية الأمل (المنصورة)
- صيدلية الحياة (أسوان)

### المنتجات
- مسكنات: بانادول إكسترا، أسبرين، فولتارين
- فيتامينات: فيتامين د3، أوميجا 3، كالسيوم د3
- مضادات حيوية: أوجمنتين، زيثروماكس
- أدوية القلب: كونكور
- أدوية السكري: إنسولين

## الأمان
- JWT Authentication
- Password Hashing باستخدام SHA256
- Role-based Authorization

## التقنيات المستخدمة
- ASP.NET Core 8.0
- Entity Framework Core
- MySQL
- JWT Authentication
- Mapster (Object Mapping)
- FluentValidation
- Swagger/OpenAPI

## ملاحظات
- تأكد من تشغيل MySQL Server قبل تشغيل التطبيق
- قم بتحديث connection string حسب إعدادات قاعدة البيانات لديك
- البيانات التجريبية تحتوي على كلمات مرور مُشفرة، يجب استبدالها بكلمات مرور حقيقية مُشفرة

## هيكل قاعدة البيانات

### الجداول الرئيسية:
1. **Users** - المستخدمين (عملاء، أدمن صيدليات، سوبر أدمن)
2. **Pharmacies** - الصيدليات
3. **Products** - المنتجات والأدوية
4. **Orders** - الطلبات
5. **OrderItems** - عناصر الطلبات

### العلاقات:
- User (1) -> Pharmacy (0..1) - كل مستخدم أدمن يمكن أن يملك صيدلية واحدة
- Pharmacy (1) -> Products (0..*) - كل صيدلية تحتوي على منتجات متعددة
- User (1) -> Orders (0..*) - كل مستخدم يمكن أن يقوم بطلبات متعددة
- Pharmacy (1) -> Orders (0..*) - كل صيدلية تستقبل طلبات متعددة
- Order (1) -> OrderItems (1..*) - كل طلب يحتوي على عناصر متعددة
- Product (1) -> OrderItems (0..*) - كل منتج يمكن أن يكون في طلبات متعددة
