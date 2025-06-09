using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using RxCloseAPI.DTOs;

namespace RxCloseAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ChatBotController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public ChatBotController(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        LoadEnvironmentVariables();
    }

    private void LoadEnvironmentVariables()
    {
        try
        {
            // Load from local.env file if exists
            var envFile = Path.Combine(Directory.GetCurrentDirectory(), "local.env");
            if (System.IO.File.Exists(envFile))
            {
                var lines = System.IO.File.ReadAllLines(envFile);
                foreach (var line in lines)
                {
                    if (!string.IsNullOrWhiteSpace(line) && !line.StartsWith("#"))
                    {
                        var parts = line.Split('=', 2);
                        if (parts.Length == 2)
                        {
                            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Could not load environment file: {ex.Message}");
        }
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
    {
        try
        {
            Console.WriteLine($"ChatBot: Received message: {request.Message}");

            // التحقق من وجود Gemini API Key (من Environment أو Configuration)
            var geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? _configuration["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(geminiApiKey))
            {
                return Ok(new ChatMessageResponse 
                { 
                    Message = "⚠️ لم يتم تكوين Gemini API Key. يرجى إعداد المفتاح للحصول على ردود الذكاء الاصطناعي.",
                    IsAI = false
                });
            }

            // إرسال الطلب إلى Gemini فقط
            var geminiResponse = await CallGeminiAPI(request.Message, geminiApiKey);
            
            return Ok(new ChatMessageResponse 
            { 
                Message = geminiResponse,
                IsAI = true
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ChatBot Error: {ex.Message}");
            return Ok(new ChatMessageResponse 
            { 
                Message = $"⚠️ حدث خطأ في الاتصال بـ Gemini AI: {ex.Message}\n\nيرجى المحاولة مرة أخرى أو التحقق من الاتصال بالإنترنت.",
                IsAI = false
            });
        }
    }

    private async Task<string> CallGeminiAPI(string message, string apiKey)
    {
        var systemPrompt = @"أنت مساعد صيدلية ذكي ومتخصص تستخدم تقنيات الذكاء الاصطناعي المتقدمة. دورك:

🎯 **المهام الأساسية:**
1. تقديم معلومات دقيقة عن الأدوية الشائعة (الاستخدام، الجرعات، التحذيرات)
2. نصائح للأعراض البسيطة مع توضيح متى تحتاج لاستشارة طبية
3. إرشادات صحية عامة وآمنة
4. معلومات عن التفاعلات الدوائية الأساسية
5. نصائح للوقاية والرعاية الذاتية

⚠️ **القيود المهمة:**
- لا تشخص الأمراض أبداً
- لا تصف أدوية محددة بدون استشارة طبية
- وجه للطبيب في الحالات الجدية
- اذكر دائماً أهمية استشارة المختصين

📝 **نمط الإجابة:**
- باللغة العربية الواضحة
- استخدم الرموز والتنسيق الجميل (🔸💊📋⚠️🌿)
- منظم بنقاط وعناوين فرعية
- مفيد وعملي
- لا تتجاوز 300 كلمة

💡 **للأسئلة غير الطبية:** اعتذر بأدب واشرح تخصصك في المجال الصيدلاني والصحي.

🤝 **اجعل ردودك:** ودية، مفيدة، آمنة، ومشجعة للرعاية الصحية المسؤولة.";

        var fullPrompt = $"{systemPrompt}\n\nالسؤال: {message}";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = fullPrompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.8,
                topK = 40,
                topP = 0.95,
                maxOutputTokens = 500
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();

        var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}", content);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
            
            return geminiResponse?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text?.Trim() 
                   ?? "عذراً، لم أتمكن من معالجة طلبك في الوقت الحالي.";
        }
        else
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Gemini API Error: {response.StatusCode} - {errorContent}");
            return $"⚠️ خطأ في API Gemini: {response.StatusCode}\n\nتفاصيل الخطأ: {errorContent}\n\nيرجى التحقق من صحة API Key أو المحاولة لاحقاً.";
        }
    }


}

// DTOs for ChatBot
public class ChatMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public string? UserId { get; set; }
}

public class ChatMessageResponse
{
    public string Message { get; set; } = string.Empty;
    public bool IsAI { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
}

// Gemini Response Models
public class GeminiResponse
{
    public GeminiCandidate[]? candidates { get; set; }
}

public class GeminiCandidate
{
    public GeminiContent? content { get; set; }
}

public class GeminiContent
{
    public GeminiPart[]? parts { get; set; }
}

public class GeminiPart
{
    public string? text { get; set; }
} 