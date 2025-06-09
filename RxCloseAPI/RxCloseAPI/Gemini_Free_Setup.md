# 🆓 إعداد Google Gemini API مجاناً

## ✨ المميزات المجانية
- **15 طلب/دقيقة مجاناً** (900 طلب/ساعة)
- **1 مليون token/شهر مجاناً**
- **لا حاجة لبطاقة ائتمان**
- **نموذج متطور مع دعم ممتاز للعربية**

## 📝 الحصول على API Key مجاناً

### الخطوة 1: إنشاء حساب Google AI Studio
1. اذهب إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. سجل دخول بحساب Google الخاص بك
3. اقبل الشروط والأحكام

### الخطوة 2: إنشاء API Key
1. انقر على **"Create API key"**
2. اختر **"Create API key in new project"**
3. انسخ الـ API Key واحتفظ به في مكان آمن

### الخطوة 3: إضافة API Key في المشروع
في ملف `appsettings.json`:
```json
{
  "Gemini": {
    "ApiKey": "AIzaSyD-your-actual-gemini-api-key-here"
  }
}
```

### الخطوة 4: تشغيل المشروع
```bash
cd RxCloseAPI/RxCloseAPI
dotnet run
```

## 🚀 اختبار النظام

### اختبار سريع
أرسل طلب POST إلى:
```
POST http://localhost:5258/api/chatbot/message
{
  "message": "أعاني من صداع، ما النصيحة؟"
}
```

### الرد المتوقع
```json
{
  "message": "للصداع، أنصحك بالتالي:\n\n1. تناول باراسيتامول 500 مجم...",
  "isAI": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔧 حل المشاكل الشائعة

### خطأ 403 - API key not valid
**السبب:** API Key خطأ أو منتهي الصلاحية
**الحل:**
1. تأكد من نسخ API Key كاملاً
2. تحقق من أن API Key نشط في Google AI Studio
3. جرب إنشاء API Key جديد

### خطأ 429 - Quota exceeded
**السبب:** تجاوز الحد المجاني (15 طلب/دقيقة)
**الحل:**
1. انتظر دقيقة وأعد المحاولة
2. قم بتطبيق rate limiting في الكود
3. ترقية لحساب مدفوع إذا لزم الأمر

### بطء في الاستجابة
**الحل:**
1. تحقق من سرعة الإنترنت
2. جرب تقليل maxOutputTokens
3. استخدم نموذج أسرع: `gemini-1.5-flash-latest`

## 💡 تحسينات إضافية

### إضافة Rate Limiting
```csharp
// في ChatBotController
private static DateTime _lastRequest = DateTime.MinValue;
private static readonly TimeSpan _rateLimitDelay = TimeSpan.FromSeconds(4); // 15 requests/minute

public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
{
    // Rate limiting
    var timeSinceLastRequest = DateTime.Now - _lastRequest;
    if (timeSinceLastRequest < _rateLimitDelay)
    {
        await Task.Delay(_rateLimitDelay - timeSinceLastRequest);
    }
    _lastRequest = DateTime.Now;
    
    // باقي الكود...
}
```

### Cache للردود الشائعة
```csharp
private static readonly Dictionary<string, string> _responseCache = new();

private string GetCachedResponse(string message)
{
    var key = message.ToLower().Trim();
    return _responseCache.TryGetValue(key, out string cached) ? cached : null;
}

private void CacheResponse(string message, string response)
{
    var key = message.ToLower().Trim();
    _responseCache[key] = response;
}
```

## 🌟 بدائل أخرى مجانية

### 1. Hugging Face (1000 طلب/شهر)
```bash
# تسجيل في huggingface.co
# استخدام: https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium
```

### 2. Ollama (محلي مجاني بالكامل)
```bash
# تثبيت Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# تحميل نموذج عربي
ollama pull aya:8b

# تشغيل API محلي
ollama serve
```

### 3. LocalAI (مفتوح المصدر)
```bash
# Docker
docker run -p 8080:8080 --name local-ai -ti localai/localai:latest
```

## ⚡ مقارنة سريعة

| النموذج | مجاني؟ | دعم العربية | سهولة الإعداد | الاستجابة |
|---------|--------|------------|-------------|----------|
| **Gemini** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Hugging Face | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Ollama | ✅ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 الخلاصة
**Google Gemini** هو الخيار الأمثل لمشروعك:
- مجاني تماماً بحدود كافية للاستخدام العادي
- دعم ممتاز للغة العربية
- سهولة في الإعداد
- موثوقية عالية من Google

## 📞 الدعم
إذا واجهت أي مشكلة:
1. راجع [Gemini API Documentation](https://ai.google.dev/docs)
2. تحقق من [Google AI Studio](https://makersuite.google.com/)
3. راجع [Community Forums](https://developers.googleblog.com/) 