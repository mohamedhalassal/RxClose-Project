# 🏥 RxClose - نظام إدارة الصيدليات والأدوية

## 📋 نظرة عامة
RxClose هو نظام شامل لإدارة الصيدليات والأدوية يتكون من:
- **Backend API**: مبني باستخدام ASP.NET Core 8.0 
- **Frontend**: مبني باستخدام Angular 19
- **قاعدة البيانات**: MySQL

## 🚀 البدء السريع

### المتطلبات الأساسية
قبل تشغيل المشروع، تأكد من تثبيت:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (الإصدار 18 أو أحدث)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (الإصدار 8.0 أو أحدث)
- [Git](https://git-scm.com/)

---

## 🗄️ إعداد قاعدة البيانات MySQL

### 1. تشغيل MySQL Server
```bash
# تأكد من تشغيل MySQL Server على المنفذ 3306 (أو 3307 كما في المشروع)
# يمكنك تغيير المنفذ في ملف appsettings.json
```

### 2. إنشاء قاعدة البيانات
```sql
CREATE DATABASE rxclose_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. إنشاء مستخدم قاعدة البيانات (اختياري)
```sql
CREATE USER 'rxclose_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON rxclose_db.* TO 'rxclose_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## ⚙️ إعداد الـ Backend (API)

### 1. الانتقال إلى مجلد الـ API
```bash
cd RxCloseAPI/RxCloseAPI
```

### 2. تحديث إعدادات الاتصال بقاعدة البيانات
افتح ملف `appsettings.json` وعدّل connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=rxclose_db;User=root;Password=your_mysql_password;Connection Timeout=30;"
  }
}
```

### 3. استعادة الحزم وتطبيق Migration
```bash
# استعادة حزم NuGet
dotnet restore

# إضافة migration إذا لم يكن موجوداً
dotnet ef migrations add InitialCreate

# تطبيق Migration على قاعدة البيانات
dotnet ef database update
```

### 4. إضافة البيانات التجريبية
```bash
# تشغيل ملف البيانات التجريبية على قاعدة البيانات
mysql -u root -p rxclose_db < ../../insert_users.sql
```

### 5. تشغيل الـ Backend
```bash
dotnet run
```

سيعمل الـ API على:
- **HTTPS**: `https://localhost:7000`
- **HTTP**: `http://localhost:5000`

---

## 🌐 إعداد الـ Frontend

### 1. الانتقال إلى مجلد الفرونت إند
```bash
cd RxClose-frontend/RxClose-main
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. تشغيل الفرونت إند
```bash
npm start
# أو
ng serve
```

سيعمل الفرونت إند على: `http://localhost:4200`

---

## 👤 إنشاء حساب Super Admin

### الطريقة الأولى: استخدام البيانات الجاهزة
```bash
# البيانات الافتراضية للسوبر أدمن (من ملف superadmin.json):
البريد الإلكتروني: superadmin@rxclose.com
كلمة المرور: Admin@123
الدور: superadmin
```

### الطريقة الثانية: إنشاء حساب جديد برمجياً
```bash
# يمكنك تشغيل الـ API واستخدام endpoint التالي:
POST /api/users/register
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "YourStrongPassword123!",
  "role": "superadmin",
  "phoneNumber": "01234567890",
  "location": "System"
}
```

### تغيير دور مستخدم موجود إلى Super Admin
```bash
# استخدم API endpoint:
PUT /api/users/{userId}/role
{
  "role": "superadmin"
}
```

---

## 🔧 تشغيل النظام بالكامل

### باستخدام ملف batch (Windows)
```bash
# تشغيل الملف الجاهز
./start-system.bat
```

### تشغيل يدوي
```bash
# 1. تشغيل الـ Backend
cd RxCloseAPI/RxCloseAPI
dotnet run

# 2. في terminal آخر، تشغيل الفرونت إند
cd RxClose-frontend/RxClose-main
npm start
```

---

## 📖 كيف يعمل المشروع

### النظام العام
1. **المستخدمون**: يمكن أن يكونوا عملاء عاديين، أدمن صيدليات، أو سوبر أدمن
2. **الصيدليات**: يديرها أدمن الصيدليات ويحتاج تفعيل من السوبر أدمن
3. **المنتجات**: يمكن أن تكون منتجات RxClose أو منتجات صيدليات خاصة
4. **الطلبات**: العملاء يطلبون من الصيدليات

### أدوار المستخدمين
- **Super Admin**: إدارة النظام بالكامل، تفعيل الصيدليات، إدارة المستخدمين
- **Pharmacy Admin**: إدارة صيدلية واحدة، إدارة المنتجات والطلبات
- **User**: تصفح الصيدليات والمنتجات، إجراء طلبات

### ميزات النظام
- 🔐 **الأمان**: JWT Authentication مع Role-based Authorization
- 🤖 **الذكاء الاصطناعي**: ChatBot مدعوم بـ Gemini AI
- 📊 **التقارير**: لوحة تحكم مع إحصائيات شاملة
- 📧 **إعادة تعيين كلمة المرور**: عبر البريد الإلكتروني
- 🔍 **البحث**: في المنتجات والصيدليات

---

## 🛠️ APIs المتاحة

### 🔐 Authentication & Users
```bash
# تسجيل حساب جديد
POST /api/users/register

# تسجيل الدخول
POST /api/users/login

# الحصول على جميع المستخدمين
GET /api/users

# الحصول على مستخدم محدد
GET /api/users/{id}

# إضافة مستخدم جديد
POST /api/users

# تحديث مستخدم
PUT /api/users/{id}

# حذف مستخدم
DELETE /api/users/{id}

# تحديث دور المستخدم
PUT /api/users/{id}/role

# إعادة تعيين كلمة المرور
POST /api/users/forgot-password
POST /api/users/reset-password
```

### 🏥 Pharmacies
```bash
# الحصول على جميع الصيدليات
GET /api/pharmacy

# الحصول على صيدلية محددة
GET /api/pharmacy/{id}

# إضافة صيدلية جديدة
POST /api/pharmacy

# تحديث صيدلية
PUT /api/pharmacy/{id}

# حذف صيدلية
DELETE /api/pharmacy/{id}

# تحديث حالة الصيدلية
PUT /api/pharmacy/{id}/status

# التحقق من الصيدلية
PUT /api/pharmacy/{id}/verify

# إحصائيات الصيدليات
GET /api/pharmacy/statistics
```

### 💊 Products
```bash
# الحصول على جميع المنتجات
GET /api/product

# منتجات RxClose
GET /api/product/rxclose

# منتجات الصيدليات
GET /api/product/pharmacy-products

# الحصول على منتج محدد
GET /api/product/{id}

# منتجات صيدلية محددة
GET /api/product/pharmacy/{pharmacyId}

# إضافة منتج جديد
POST /api/product

# إضافة منتج RxClose
POST /api/product/rxclose

# إضافة منتج صيدلية
POST /api/product/pharmacy

# تحديث منتج
PUT /api/product/{id}

# حذف منتج
DELETE /api/product/{id}

# إحصائيات المنتجات
GET /api/product/statistics

# الفئات المتاحة
GET /api/product/categories

# البحث في المنتجات
GET /api/product/search?query={searchTerm}
```

### 📊 Dashboard & Reports
```bash
# الإحصائيات العامة
GET /api/dashboard/statistics

# إحصائيات لوحة التحكم
GET /api/reports/dashboard-statistics

# تحليلات المستخدمين
GET /api/reports/user-analytics

# أداء الصيدليات
GET /api/reports/pharmacy-performance

# بيانات الرسوم البيانية
GET /api/reports/chart-data

# الطلبات الحديثة
GET /api/reports/recent-orders
```

### 🤖 AI ChatBot
```bash
# التحدث مع البوت
POST /api/chatbot/ask

# تاريخ المحادثات
GET /api/chatbot/history
```

---

## 👥 البيانات التجريبية

### المستخدمين الافتراضيين
| النوع | البريد الإلكتروني | كلمة المرور | الدور |
|-------|-------------------|-------------|-------|
| Super Admin | ahmed@rxclose.com | password123 | superadmin |
| Pharmacy Admin | fatma@pharmacy1.com | password123 | admin |
| Pharmacy Admin | mohamed@pharmacy2.com | password123 | admin |
| مستخدم عادي | sara@user.com | password123 | user |
| مستخدم عادي | ali@user.com | password123 | user |

### الصيدليات التجريبية
- **صيدلية النور** - القاهرة
- **صيدلية الشفاء** - الإسكندرية  
- **صيدلية الأمل** - المنصورة
- **صيدلية الحياة** - أسوان

### المنتجات التجريبية
- **مسكنات**: بانادول إكسترا، أسبرين، فولتارين
- **فيتامينات**: فيتامين د3، أوميجا 3، كالسيوم د3
- **مضادات حيوية**: أوجمنتين، زيثروماكس
- **أدوية القلب**: كونكور
- **أدوية السكري**: إنسولين

---

## 🔧 إعدادات إضافية

### إعداد الذكاء الاصطناعي (Gemini)
1. احصل على API Key من [Google AI Studio](https://makersuite.google.com/app/apikey)
2. أضف المفتاح في `appsettings.json`:
```json
{
  "Gemini": {
    "ApiKey": "your_gemini_api_key_here"
  }
}
```

### إعداد البريد الإلكتروني
1. فعّل "App Passwords" في Gmail
2. أضف الإعدادات في `appsettings.json`:
```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "your-email@gmail.com",
    "FromPassword": "your-app-password"
  }
}
```

---

## 🛡️ الأمان

### JWT Authentication
- مدة انتهاء الـ Token: 60 دقيقة (قابل للتغيير)
- خوارزمية التشفير: HS256
- Role-based Authorization

### تشفير كلمات المرور
- استخدام BCrypt للتشفير
- دعم ترقية كلمات المرور القديمة (SHA256) تلقائياً

---

## 🌐 النشر والاستضافة

### متغيرات البيئة للإنتاج
```bash
# في appsettings.Production.json
{
  "ConnectionStrings": {
    "DefaultConnection": "your_production_connection_string"
  },
  "Jwt": {
    "Key": "your_super_secret_production_key_min_32_chars"
  }
}
```

### بناء المشروع للإنتاج
```bash
# Backend
cd RxCloseAPI/RxCloseAPI
dotnet publish -c Release

# Frontend  
cd RxClose-frontend/RxClose-main
ng build --prod
```

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### خطأ في الاتصال بقاعدة البيانات
```bash
# تأكد من:
1. تشغيل MySQL Server
2. صحة connection string
3. وجود قاعدة البيانات
4. صلاحيات المستخدم
```

#### خطأ في CORS
```bash
# في Program.cs، تأكد من إعداد CORS بشكل صحيح
app.UseCors("AllowAll");
```

#### خطأ في Migration
```bash
# حذف وإعادة إنشاء Migration
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 📱 الميزات المتقدمة

### ChatBot AI
- مدعوم بـ Google Gemini AI
- يجيب على الاستفسارات الطبية والدوائية
- حفظ تاريخ المحادثات

### إدارة المخزون
- تتبع كميات المنتجات
- تنبيهات المخزون المنخفض
- إدارة تواريخ الانتهاء

### التقارير والإحصائيات
- إحصائيات المبيعات
- تحليل أداء الصيدليات
- تقارير المستخدمين

---

## 🤝 المساهمة في المشروع

### متطلبات التطوير
1. Fork المشروع
2. إنشاء branch جديد للميزة
3. Commit التغييرات
4. Push إلى Branch
5. إنشاء Pull Request

### معايير الكود
- استخدام Clean Architecture
- كتابة Unit Tests
- توثيق الـ APIs
- اتباع معايير C# و Angular

---

## 📞 الدعم والمساعدة

### التواصل
- **المطور الرئيسي**: [مريم جمال](https://github.com/marygamal621)
- **البريد الإلكتروني**: marygamal621@gmail.com
- **GitHub Issues**: لأي مشاكل أو اقتراحات

### الموارد المفيدة
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Angular Documentation](https://angular.io/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🎯 خارطة الطريق

### الميزات القادمة
- [ ] تطبيق موبايل (React Native)
- [ ] نظام دفع إلكتروني
- [ ] تتبع الطلبات في الوقت الفعلي
- [ ] نظام تقييم الصيدليات
- [ ] دعم متعدد اللغات
- [ ] API للأطباء

---

**مع تحيات فريق تطوير RxClose 💊✨**
