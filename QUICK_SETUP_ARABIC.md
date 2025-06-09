# 🚀 دليل الإعداد السريع - RxClose

## ملخص سريع للبدء

### 1️⃣ إعداد قاعدة البيانات
```sql
-- افتح MySQL وشغل هذه الأوامر:
CREATE DATABASE rxclose_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2️⃣ إعداد الـ Backend
```bash
cd RxCloseAPI/RxCloseAPI

# عدّل connection string في appsettings.json
# غير your_mysql_password إلى كلمة مرور MySQL بتاعتك

dotnet restore
dotnet ef database update
dotnet run
```

### 3️⃣ إعداد الـ Frontend
```bash
cd RxClose-frontend/RxClose-main
npm install
npm start
```

### 4️⃣ تسجيل الدخول كـ Super Admin
```
البريد الإلكتروني: superadmin@rxclose.com
كلمة المرور: Admin@123
```

---

## 🔗 الروابط المهمة

- **Frontend**: http://localhost:4200
- **Backend API**: https://localhost:7000
- **API Documentation**: https://localhost:7000/swagger

---

## 🆘 مشاكل شائعة

### مشكلة 1: خطأ في قاعدة البيانات
```bash
# تأكد من تشغيل MySQL Server
# تأكد من صحة connection string في appsettings.json
```

### مشكلة 2: خطأ في الفرونت إند
```bash
cd RxClose-frontend/RxClose-main
npm install --force
npm start
```

### مشكلة 3: مشكلة في الـ ports
```bash
# تأكد من أن ports 4200, 5000, 7000 مش مستخدمة
netstat -ano | findstr :4200
```

---

## 📱 للاستخدام السريع
```bash
# شغل الأمر ده من root directory
start-system.bat
```

---

**🎯 هدف النظام**: إدارة الصيدليات والأدوية بنظام شامل يدعم العملاء وأصحاب الصيدليات والإدارة 