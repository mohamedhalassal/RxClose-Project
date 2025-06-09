# إعداد ChatBot الذكي للصيدلية

## المميزات الجديدة
✅ **مساعد صيدلية ذكي** مطور بتقنية الذكاء الاصطناعي  
✅ **ردود طبية متخصصة** باللغة العربية  
✅ **نصائح آمنة** مع التوجيه لاستشارة الطبيب  
✅ **نظام احتياطي** يعمل حتى بدون API Key  

## إعداد OpenAI API (اختياري)

### 1. الحصول على API Key
1. اذهب إلى [OpenAI Platform](https://platform.openai.com/)
2. سجل حساب جديد أو سجل دخول
3. اذهب إلى API Keys في لوحة التحكم
4. أنشئ API Key جديد

### 2. إضافة API Key في المشروع
في ملف `appsettings.json`:
```json
{
  "OpenAI": {
    "ApiKey": "sk-your-actual-openai-api-key-here"
  }
}
```

### 3. إعداد متغيرات البيئة (للإنتاج)
```bash
export OPENAI_APIKEY="sk-your-actual-openai-api-key-here"
```

## كيفية عمل النظام

### مع OpenAI API
- يرسل الأسئلة إلى GPT-3.5 Turbo
- يحصل على ردود ذكية ومتخصصة
- يضمن الردود باللغة العربية
- يحد من طول الإجابات (200 كلمة)

### بدون OpenAI API (نظام احتياطي)
- يستخدم قاعدة بيانات محلية للأعراض الشائعة
- يقدم نصائح أساسية وآمنة
- يوجه المستخدم لاستشارة الطبيب

## الاستخدام

### من الـ Frontend
```typescript
// في أي component
import { ChatbotService } from './shared/services/chatbot.service';

// إرسال رسالة
this.chatbotService.sendMessage('أعاني من صداع').subscribe(response => {
  console.log(response.message); // الرد من الـ ChatBot
  console.log(response.isAI);    // true إذا كان من OpenAI
});
```

### من الـ Backend API
```bash
POST /api/chatbot/message
{
  "message": "أعاني من صداع شديد",
  "userId": "optional-user-id"
}
```

Response:
```json
{
  "message": "للصداع، يمكنك تناول باراسيتامول...",
  "isAI": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## نصائح مهمة

### الأمان
- النظام يرفض تشخيص الأمراض
- يوجه دائماً لاستشارة المختصين
- لا يصف أدوية محددة بدون إشراف طبي

### التكلفة
- OpenAI API ليس مجاني
- كل رسالة تكلف حوالي $0.002
- يمكن تحديد ميزانية شهرية في لوحة تحكم OpenAI

### البدائل المجانية
يمكنك استخدام بدائل مجانية:
- **Hugging Face Transformers** (محلي)
- **Google PaLM API** (مجاني محدود)
- **Ollama** (تشغيل محلي)

## استكشاف الأخطاء

### خطأ في OpenAI API
- تحقق من صحة API Key
- تأكد من وجود رصيد في الحساب
- راجع rate limits في لوحة التحكم

### بطء في الاستجابة
- زد timeout في HttpClient
- استخدم نماذج أسرع (gpt-3.5-turbo-instruct)
- قلل max_tokens

### مشاكل CORS
تأكد من إضافة domain الـ frontend في CORS:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        builder => builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader());
});
```

## التطوير المستقبلي

### مميزات مقترحة
- حفظ تاريخ المحادثات
- تحليل الأعراض بالذكاء الاصطناعي
- ربط مع قاعدة بيانات الأدوية
- إشعارات لتذكير بتناول الدواء
- تقييم التفاعلات الدوائية

### تحسينات الأداء
- Cache للردود الشائعة
- Streaming responses
- Background processing
- Rate limiting للمستخدمين 