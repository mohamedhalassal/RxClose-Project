# 📤 تعليمات رفع المشروع على GitHub

## خطوات رفع المشروع على GitHub

### الخطوة 1: إعداد الحساب والريبو
1. تأكد من تسجيل الدخول إلى GitHub باستخدام حساب `marygamal621`
2. تأكد من أن الريبو `https://github.com/marygamal621/Rx-Close` موجود وفارغ

### الخطوة 2: إعداد Git محلياً
```bash
# إعداد اسم المستخدم والإيميل
git config --global user.name "marygamal621"
git config --global user.email "marygamal621@gmail.com"

# التأكد من أن المجلد الحالي هو مجلد المشروع
cd /path/to/your/RxClose-backend

# إعداد Git (إذا لم يكن معداً مسبقاً)
git init
git add .
git commit -m "Initial commit: RxClose Pharmacy Management System"
```

### الخطوة 3: ربط الريبو المحلي بـ GitHub
```bash
# إضافة remote origin
git remote add origin https://github.com/marygamal621/Rx-Close.git

# أو إذا كان موجوداً مسبقاً
git remote set-url origin https://github.com/marygamal621/Rx-Close.git

# تغيير اسم البرانش إلى main
git branch -M main
```

### الخطوة 4: رفع المشروع
```bash
# طريقة 1: باستخدام HTTPS مع Personal Access Token
git push -u origin main

# طريقة 2: إذا كانت هناك مشكلة في التوثيق، استخدم SSH
# أولاً أضف SSH key إلى GitHub
# ثم غير الـ URL:
git remote set-url origin git@github.com:marygamal621/Rx-Close.git
git push -u origin main
```

### إذا واجهت مشكلة في التوثيق:

#### الطريقة 1: Personal Access Token
1. اذهب إلى GitHub Settings > Developer settings > Personal access tokens
2. أنشئ token جديد مع صلاحيات repo
3. استخدم الـ token كـ password عند الطلب

#### الطريقة 2: SSH Key
```bash
# إنشاء SSH key جديد
ssh-keygen -t rsa -b 4096 -C "marygamal621@gmail.com"

# إضافة المفتاح إلى SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# نسخ المفتاح العام
cat ~/.ssh/id_rsa.pub

# أضف المفتاح إلى GitHub Settings > SSH and GPG keys
```

### الخطوة 5: التحقق من الرفع
بعد رفع المشروع بنجاح، تأكد من:
- ✅ وجود جميع الملفات في الريبو
- ✅ ظهور ملف README.md الجديد
- ✅ عدم وجود ملفات حساسة (passwords, API keys)

---

## 🚀 البدء السريع بعد الرفع

بعد رفع المشروع، يمكن لأي شخص نسخه وتشغيله كالتالي:

```bash
# نسخ المشروع
git clone https://github.com/marygamal621/Rx-Close.git
cd Rx-Close

# تشغيل النظام (Windows)
start-system.bat

# أو تشغيل يدوي:
# Backend
cd RxCloseAPI/RxCloseAPI
dotnet restore
dotnet ef database update
dotnet run

# Frontend (في terminal منفصل)
cd RxClose-frontend/RxClose-main
npm install
npm start
```

---

## 📋 قائمة التحقق النهائية

- [ ] تم رفع جميع ملفات المشروع
- [ ] ملف README.md شامل ومفصل
- [ ] لا توجد ملفات حساسة مرفوعة
- [ ] ملف .gitignore محدث
- [ ] ملف start-system.bat يعمل
- [ ] التوثيق باللغة العربية كامل
- [ ] قائمة APIs شاملة
- [ ] تعليمات إعداد قاعدة البيانات واضحة
- [ ] معلومات المستخدمين التجريبيين متوفرة

---

**ملاحظة**: تأكد من تحديث أي معلومات حساسة في الملفات قبل الرفع! 