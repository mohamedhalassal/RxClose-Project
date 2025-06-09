# 📊 ملخص مشروع RxClose

## 🎯 الهدف من المشروع
نظام شامل لإدارة الصيدليات والأدوية يربط بين العملاء وأصحاب الصيدليات ويوفر إدارة مركزية للنظام.

---

## 🏗️ التقنيات المستخدمة

### Backend (الخادم)
- **Framework**: ASP.NET Core 8.0
- **Database**: MySQL
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Password Hashing**: BCrypt
- **API Documentation**: Swagger/OpenAPI
- **Object Mapping**: Mapster
- **AI Integration**: Google Gemini AI
- **Email Service**: SMTP (Gmail)

### Frontend (الواجهة)
- **Framework**: Angular 19
- **UI Library**: Bootstrap 5
- **Icons**: FontAwesome
- **Charts**: Chart.js + ng2-charts
- **HTTP Client**: Angular HttpClient
- **Styling**: CSS3 + Bootstrap

### Database Schema
```
Users (المستخدمين)
├── SuperAdmin (إدارة كاملة)
├── PharmacyAdmin (إدارة صيدلية)
└── User (عميل عادي)

Pharmacies (الصيدليات)
├── معلومات الصيدلية
├── الموقع والعنوان
└── حالة التفعيل

Products (المنتجات)
├── منتجات RxClose
├── منتجات الصيدليات
└── معلومات الدواء والسعر

Orders (الطلبات)
├── طلبات العملاء
├── حالة الطلب
└── عناصر الطلب
```

---

## 🔐 نظام الأمان

### المصادقة (Authentication)
- JWT Token مع انتهاء صلاحية 60 دقيقة
- تشفير كلمات المرور باستخدام BCrypt
- دعم ترقية كلمات المرور القديمة تلقائياً

### التفويض (Authorization)
- Role-based access control
- 3 مستويات صلاحيات: User, Admin, SuperAdmin
- حماية APIs حسب الدور

### حماية البيانات
- إخفاء المعلومات الحساسة في ملفات التكوين
- استخدام Environment Variables للإنتاج
- تشفير البيانات الحساسة

---

## 🚀 الميزات الرئيسية

### للعملاء (Users)
- ✅ تصفح الصيدليات والأدوية
- ✅ البحث في المنتجات
- ✅ إجراء طلبات من الصيدليات
- ✅ متابعة حالة الطلبات
- ✅ ChatBot للاستفسارات الطبية

### لأصحاب الصيدليات (Pharmacy Admins)
- ✅ إدارة منتجات الصيدلية
- ✅ استقبال ومعالجة الطلبات
- ✅ إدارة المخزون والأسعار
- ✅ تقارير المبيعات
- ✅ إدارة معلومات الصيدلية

### للإدارة العامة (Super Admins)
- ✅ إدارة جميع المستخدمين
- ✅ تفعيل والتحقق من الصيدليات
- ✅ إدارة منتجات RxClose
- ✅ مراقبة النظام والتقارير
- ✅ إدارة إعدادات النظام

### الميزات المتقدمة
- 🤖 **ChatBot AI**: مدعوم بـ Gemini AI للإجابة على الاستفسارات الطبية
- 📊 **Dashboard**: إحصائيات شاملة ورسوم بيانية
- 📧 **إعادة تعيين كلمة المرور**: عبر البريد الإلكتروني
- 🔍 **البحث المتقدم**: في المنتجات والصيدليات
- 📱 **Responsive Design**: يعمل على جميع الأجهزة

---

## 📊 الإحصائيات والتقارير

### لوحة التحكم
- إجمالي المستخدمين والصيدليات
- إحصائيات المبيعات
- تحليل أداء الصيدليات
- معدلات النمو الشهرية

### التقارير المتاحة
- تقارير المستخدمين
- أداء الصيدليات
- إحصائيات المنتجات
- الطلبات الحديثة
- بيانات الرسوم البيانية

---

## 🛠️ APIs المتوفرة

### Users & Authentication (16 endpoints)
```
POST /api/users/register        # تسجيل حساب جديد
POST /api/users/login          # تسجيل الدخول
GET  /api/users               # جلب جميع المستخدمين
GET  /api/users/{id}          # جلب مستخدم محدد
PUT  /api/users/{id}          # تحديث مستخدم
DELETE /api/users/{id}        # حذف مستخدم
PUT  /api/users/{id}/role     # تحديث دور المستخدم
POST /api/users/forgot-password # إعادة تعيين كلمة المرور
... والمزيد
```

### Pharmacies (8 endpoints)
```
GET  /api/pharmacy             # جلب جميع الصيدليات
POST /api/pharmacy            # إضافة صيدلية جديدة
PUT  /api/pharmacy/{id}       # تحديث صيدلية
PUT  /api/pharmacy/{id}/verify # التحقق من الصيدلية
... والمزيد
```

### Products (12 endpoints)
```
GET  /api/product             # جلب جميع المنتجات
POST /api/product/rxclose     # إضافة منتج RxClose
POST /api/product/pharmacy    # إضافة منتج صيدلية
GET  /api/product/search      # البحث في المنتجات
... والمزيد
```

### Reports & Dashboard (8 endpoints)
```
GET  /api/dashboard/statistics     # الإحصائيات العامة
GET  /api/reports/user-analytics   # تحليلات المستخدمين
GET  /api/reports/pharmacy-performance # أداء الصيدليات
... والمزيد
```

### AI ChatBot (2 endpoints)
```
POST /api/chatbot/ask         # التحدث مع البوت
GET  /api/chatbot/history     # تاريخ المحادثات
```

**المجموع: 46+ API Endpoint**

---

## 👥 البيانات التجريبية

### حسابات جاهزة للاختبار
| النوع | البريد الإلكتروني | كلمة المرور | الصلاحيات |
|-------|-------------------|-------------|-----------|
| Super Admin | ahmed@rxclose.com | password123 | إدارة كاملة |
| Pharmacy Admin | fatma@pharmacy1.com | password123 | إدارة صيدلية |
| عميل عادي | sara@user.com | password123 | تصفح وطلب |

### صيدليات تجريبية (4 صيدليات)
- صيدلية النور - القاهرة
- صيدلية الشفاء - الإسكندرية
- صيدلية الأمل - المنصورة
- صيدلية الحياة - أسوان

### منتجات تجريبية (15+ منتج)
- مسكنات الألم (بانادول، أسبرين، فولتارين)
- فيتامينات (فيتامين د3، أوميجا 3، كالسيوم)
- مضادات حيوية (أوجمنتين، زيثروماكس)
- أدوية مزمنة (كونكور، إنسولين)

---

## 📁 هيكل المشروع

```
RxClose-backend/
├── 📁 RxCloseAPI/
│   ├── 📁 Controllers/      # تحكم في APIs
│   ├── 📁 Services/         # منطق العمل
│   ├── 📁 Entities/         # نماذج قاعدة البيانات
│   ├── 📁 DTOs/             # كائنات نقل البيانات
│   ├── 📁 Persistence/      # إعدادات قاعدة البيانات
│   └── 📄 appsettings.json  # إعدادات التطبيق
├── 📁 RxClose-frontend/
│   ├── 📁 src/              # كود Angular
│   ├── 📄 package.json      # تبعيات Node.js
│   └── 📄 angular.json      # إعدادات Angular
├── 📄 README.md             # دليل شامل
├── 📄 start-system.bat      # تشغيل سريع
└── 📄 insert_users.sql      # بيانات تجريبية
```

---

## 🔮 خطة التطوير المستقبلي

### المرحلة التالية
- [ ] تطبيق موبايل (React Native / Flutter)
- [ ] نظام دفع إلكتروني متكامل
- [ ] تتبع الطلبات في الوقت الفعلي
- [ ] نظام تقييم الصيدليات والخدمة
- [ ] إشعارات Push للعملاء والصيدليات

### ميزات متقدمة
- [ ] دعم متعدد اللغات (عربي/إنجليزي)
- [ ] API للأطباء وكتابة الروشتات
- [ ] تكامل مع أنظمة المستشفيات
- [ ] تحليلات متقدمة بالذكاء الاصطناعي
- [ ] نظام الولاء والنقاط للعملاء

---

## 📞 معلومات التواصل

**المطور الرئيسي**: مريم جمال  
**GitHub**: [@marygamal621](https://github.com/marygamal621)  
**Email**: marygamal621@gmail.com  
**Repository**: https://github.com/marygamal621/Rx-Close

---

## 📜 الترخيص

هذا المشروع مرخص تحت **رخصة MIT** - انظر ملف LICENSE للتفاصيل.

---

**🎉 تم إنشاء مشروع RxClose بنجاح مع توثيق شامل وإعداد كامل للنشر!** 