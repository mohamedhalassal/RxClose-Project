# نظام البائعين في RxClose

تم تطوير نظام البائعين للتفريق بين نوعين من المنتجات:

## أنواع البائعين

### 1. منتجات الصيدلية (Pharmacy Products)
- **النوع**: `pharmacy`
- **من يضيفها**: Pharmacy Admin أو Super Admin
- **الخصائص**:
  - مرتبطة بصيدلية محددة (`PharmacyId`)
  - اسم البائع يكون اسم الصيدلية (`SellerName`)
  - تظهر في صفحة الصيدلية المحددة

### 2. منتجات RxClose (RxClose Products)
- **النوع**: `rxclose`
- **من يضيفها**: Super Admin فقط
- **الخصائص**:
  - غير مرتبطة بصيدلية (`PharmacyId = null`)
  - اسم البائع: "RxClose" (`SellerName`)
  - منتجات عامة متاحة لجميع المستخدمين

## الحقول الجديدة في Product Entity

```csharp
public string SellerType { get; set; } = "pharmacy"; // "pharmacy" أو "rxclose"
public string? SellerName { get; set; } // اسم الصيدلية أو "RxClose"
public int? PharmacyId { get; set; } // nullable للمنتجات العامة
```

## API Endpoints الجديدة

### 1. جلب منتجات RxClose فقط
```
GET /api/Product/rxclose?category={category}&status={status}
```

### 2. جلب منتجات الصيدليات فقط
```
GET /api/Product/pharmacy-products?category={category}&status={status}
```

### 3. إضافة منتج RxClose (Super Admin فقط)
```
POST /api/Product/rxclose
{
  "name": "اسم المنتج",
  "category": "الفئة",
  "description": "الوصف",
  "price": 100.00,
  "stock": 50
  // لا يحتاج PharmacyId
}
```

### 4. إضافة منتج صيدلية
```
POST /api/Product/pharmacy
{
  "name": "اسم المنتج",
  "category": "الفئة", 
  "description": "الوصف",
  "price": 100.00,
  "stock": 50,
  "pharmacyId": 1 // مطلوب
}
```

## تحديث قاعدة البيانات

لتطبيق التغييرات، قم بتشغيل:

```sql
-- أو استخدم الملف المرفق
source update_products_seller_info.sql
```

## مثال على الاستخدام

### إضافة منتج RxClose (Super Admin)
```json
POST /api/Product/rxclose
{
  "name": "باراسيتامول RxClose",
  "category": "مسكنات",
  "description": "مسكن آمن وفعال",
  "price": 25.00,
  "stock": 100,
  "prescription": false
}
```

### إضافة منتج صيدلية (Pharmacy Admin)
```json
POST /api/Product/pharmacy
{
  "name": "باراسيتامول الصيدلية الذهبية",
  "category": "مسكنات",
  "description": "متوفر في الصيدلية الذهبية",
  "price": 20.00,
  "stock": 50,
  "pharmacyId": 1,
  "prescription": false
}
```

## النتيجة في قاعدة البيانات

### منتج RxClose
```
Id: 1
Name: "باراسيتامول RxClose"
SellerType: "rxclose"
SellerName: "RxClose"
PharmacyId: null
```

### منتج صيدلية
```
Id: 2
Name: "باراسيتامول الصيدلية الذهبية"
SellerType: "pharmacy"
SellerName: "الصيدلية الذهبية"
PharmacyId: 1
```

## المزايا

1. **فصل واضح** بين منتجات الشركة ومنتجات الصيدليات
2. **مرونة في الإدارة** - كل نوع له endpoints منفصلة
3. **أمان** - فقط Super Admin يمكنه إضافة منتجات RxClose
4. **استعلامات محسنة** - فلترة سريعة حسب نوع البائع
5. **تتبع أفضل** - معرفة مصدر كل منتج 