# 🚀 دليل التشغيل السريع - نظام نسيان كلمة المرور

## ⚡ التشغيل السريع

### 1. **تشغيل النظام بالكامل**
```bash
# انقر مرتين على الملف لتشغيل النظام
start-system.bat
```

### 2. **التشغيل اليدوي**

#### Backend API:
```bash
cd C:\Users\ezzmo\Desktop\RxClose-backend\RxCloseAPI\RxCloseAPI
dotnet run
```

#### Frontend Angular:
```bash
cd "C:\Users\ezzmo\Desktop\RxClose-main(2)\RxClose-main"
ng serve
```

## 🌐 الروابط المهمة

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:5000
- **Swagger Documentation:** http://localhost:5000/swagger
- **نسيان كلمة المرور:** http://localhost:4200/auth/forgot-password

## 🧪 اختبار النظام

### 1. **اختبار Backend API**
```bash
# GET - التحقق من حالة API
curl http://localhost:5000/api/users

# POST - اختبار نسيان كلمة المرور
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. **اختبار Frontend**
1. اذهب إلى: http://localhost:4200/auth/forgot-password
2. أدخل بريد إلكتروني صحيح
3. انتظر رمز التحقق في البريد
4. أدخل الرمز وكلمة المرور الجديدة

## 📧 إعدادات البريد الإلكتروني

في `appsettings.json`:
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "Username": "ezzmosataf@gmail.com",
    "Password": "your-app-password",
    "UseSSL": true
  }
}
```

## 🔧 حل المشاكل

### مشكلة: "ERR_CONNECTION_REFUSED"
**الحل:** تأكد من تشغيل Backend API أولاً على port 5000

### مشكلة: Angular compilation errors
**الحل:** تم إصلاحها - المكون standalone component مع imports صحيحة

### مشكلة: Email not sending
**الحل:** تأكد من صحة إعدادات Gmail في appsettings.json

## 📁 هيكل المشروع

```
RxClose-backend/
├── appsettings.json          # إعدادات البريد الإلكتروني
├── Controllers/UsersController.cs  # API endpoints
├── Services/EmailService.cs        # خدمة البريد
├── Services/PasswordResetService.cs # خدمة إعادة تعيين كلمة المرور
└── start-system.bat                # تشغيل سريع

RxClose-main(2)/RxClose-main/src/app/components/forgot-password/
├── forgot-password.component.ts    # Angular component
├── forgot-password.component.html  # Template
└── forgot-password.component.css   # Styles
```

## ✅ التحقق من نجاح التشغيل

- [ ] Backend API يعمل على http://localhost:5000
- [ ] Frontend يعمل على http://localhost:4200  
- [ ] صفحة نسيان كلمة المرور تفتح بدون أخطاء
- [ ] يمكن إرسال طلب نسيان كلمة المرور
- [ ] البريد الإلكتروني يصل بنجاح

---
💡 **نصيحة:** استخدم `start-system.bat` لتشغيل النظام بالكامل بنقرة واحدة! 