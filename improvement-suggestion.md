# اقتراح تحسين تنسيق إيميل المستخدم

## الوضع الحالي:
- إيميل الصيدلية: `ezzmosataf@gmail.com`
- إيميل المستخدم: `user.ezzmosataf.638850973018530211@gmail.com`

## الاقتراح المحسن:
- إيميل الصيدلية: `ezzmosataf@gmail.com`
- إيميل المستخدم: `ezzmosataf.pharmacy.admin@gmail.com`

## المزايا:
1. أكثر وضوحاً ومفهومية
2. يشير بوضوح لدور المستخدم
3. أقصر وأسهل في القراءة
4. يحافظ على الفرادة (uniqueness)

## التنفيذ:
تعديل سطر واحد في PharmacyService.cs:
```csharp
// بدلاً من
var userEmail = $"user.{emailPrefix}.{timestamp}@{emailDomain}";

// يصبح
var userEmail = $"{emailPrefix}.pharmacy.admin@{emailDomain}";
```

هذا سيجعل الإيميل أكثر احترافية ووضوحاً. 