using System.Text.RegularExpressions;

namespace RxCloseAPI.Services;

public class LocalPharmacyAI
{
    private readonly Dictionary<string, PharmacyAdvice> _knowledgeBase;
    private readonly Dictionary<string, string[]> _symptoms;
    private readonly Dictionary<string, MedicineInfo> _medicines;

    public LocalPharmacyAI()
    {
        _knowledgeBase = InitializeKnowledgeBase();
        _symptoms = InitializeSymptoms();
        _medicines = InitializeMedicines();
    }

    public string GetAdvice(string userMessage)
    {
        var cleanMessage = CleanAndNormalize(userMessage);
        
        // تحليل الأعراض
        var detectedSymptoms = DetectSymptoms(cleanMessage);
        
        // تحليل الأدوية المذكورة
        var mentionedMedicines = DetectMedicines(cleanMessage);
        
        // تحديد نوع السؤال
        var queryType = DetermineQueryType(cleanMessage);
        
        return GenerateResponse(detectedSymptoms, mentionedMedicines, queryType, cleanMessage);
    }

    private string CleanAndNormalize(string text)
    {
        // تطبيع النص العربي
        text = text.Replace("أ", "ا").Replace("إ", "ا").Replace("آ", "ا");
        text = text.Replace("ة", "ه").Replace("ى", "ي");
        text = Regex.Replace(text, @"[^\u0600-\u06FF\s]", " ");
        return text.ToLower().Trim();
    }

    private List<string> DetectSymptoms(string message)
    {
        var detected = new List<string>();
        
        foreach (var symptom in _symptoms.Keys)
        {
            if (_symptoms[symptom].Any(keyword => message.Contains(keyword)))
            {
                detected.Add(symptom);
            }
        }
        
        return detected;
    }

    private List<string> DetectMedicines(string message)
    {
        var detected = new List<string>();
        
        foreach (var medicine in _medicines.Keys)
        {
            if (message.Contains(medicine.ToLower()) || 
                _medicines[medicine].AlternativeNames.Any(alt => message.Contains(alt.ToLower())))
            {
                detected.Add(medicine);
            }
        }
        
        return detected;
    }

    private QueryType DetermineQueryType(string message)
    {
        if (message.Contains("ما هو") || message.Contains("معلومات") || message.Contains("عن"))
            return QueryType.Information;
        
        if (message.Contains("اعاني") || message.Contains("عندي") || message.Contains("احس"))
            return QueryType.Symptom;
        
        if (message.Contains("جرعه") || message.Contains("كيف") || message.Contains("متي"))
            return QueryType.Dosage;
        
        if (message.Contains("تفاعل") || message.Contains("مع") || message.Contains("يؤثر"))
            return QueryType.Interaction;
        
        return QueryType.General;
    }

    private string GenerateResponse(List<string> symptoms, List<string> medicines, QueryType queryType, string originalMessage)
    {
        var response = new List<string>();

        // معالجة الأسئلة الخاصة أولاً
        var lowerMessage = originalMessage.ToLower();
        
        // أسئلة النوم والأرق
        if (lowerMessage.Contains("نوم") || lowerMessage.Contains("أرق") || lowerMessage.Contains("منوم"))
        {
            response.Add("🌙 **نصائح للحصول على نوم أفضل:**");
            response.Add("");
            response.Add("📋 **عادات صحية للنوم:**");
            response.Add("• حدد موعد ثابت للنوم والاستيقاظ");
            response.Add("• تجنب الكافيين بعد الساعة 2 ظهراً");
            response.Add("• أطفئ الأجهزة الإلكترونية قبل النوم بساعة");
            response.Add("• اجعل غرفة النوم باردة ومظلمة وهادئة");
            response.Add("• مارس الرياضة لكن ليس قبل النوم مباشرة");
            response.Add("");
            response.Add("🌿 **علاجات طبيعية:**");
            response.Add("• شاي البابونج قبل النوم");
            response.Add("• تقنيات التنفس والاسترخاء");
            response.Add("• تمارين التأمل لمدة 10 دقائق");
            response.Add("");
            response.Add("💊 **في حالة الأرق المستمر:**");
            response.Add("• استشر الطبيب إذا استمر الأرق أكثر من 3 أسابيع");
            response.Add("• تجنب الأدوية المنومة بدون استشارة طبية");
            
            response.Add("");
            response.Add("⚠️ **تحذير:** تجنب القيادة أو تشغيل الآلات عند تناول أدوية منومة");
            return string.Join("\n", response);
        }

        // أسئلة الحساسية
        if (lowerMessage.Contains("حساسية") || lowerMessage.Contains("حساسيه") || lowerMessage.Contains("طفح") || lowerMessage.Contains("حكة"))
        {
            response.Add("🤧 **معلومات عن الحساسية:**");
            response.Add("");
            response.Add("💊 **أدوية الحساسية الشائعة:**");
            response.Add("• **مضادات الهيستامين:**");
            response.Add("  - لوراتادين (كلاريتين) - لا يسبب النعاس");
            response.Add("  - سيتيريزين (زيرتك) - قد يسبب نعاس خفيف");
            response.Add("  - ديفينهيدرامين (بينادريل) - يسبب النعاس");
            response.Add("");
            response.Add("🌿 **الوقاية من الحساسية:**");
            response.Add("• تجنب المواد المثيرة للحساسية المعروفة");
            response.Add("• استخدم مرشحات الهواء في المنزل");
            response.Add("• اغسل الملابس بالماء الساخن");
            response.Add("• تنظيف المنزل بانتظام من الغبار");
            response.Add("");
            response.Add("🚨 **راجع الطبيب فوراً إذا كان لديك:**");
            response.Add("• صعوبة في التنفس");
            response.Add("• تورم في الوجه أو الحلق");
            response.Add("• طفح جلدي منتشر");
            response.Add("• حكة شديدة أو حرقان");
            
            return string.Join("\n", response);
        }

        // معالجة الأعراض المحددة
        if (symptoms.Any())
        {
            response.Add("📋 **بخصوص الأعراض المذكورة:**");
            response.Add("");
            foreach (var symptom in symptoms.Take(2))
            {
                if (_knowledgeBase.ContainsKey(symptom))
                {
                    var advice = _knowledgeBase[symptom];
                    response.Add($"🔸 **{symptom}:**");
                    response.Add($"   {advice.GeneralAdvice}");
                    response.Add("");
                    
                    if (advice.OverTheCounterMeds.Any())
                    {
                        response.Add($"💊 **أدوية قد تساعد:** {string.Join(" • ", advice.OverTheCounterMeds)}");
                        response.Add("");
                    }
                    
                    response.Add($"⚠️ **متى تراجع الطبيب:** {advice.WhenToSeeDoctor}");
                    response.Add("");
                }
            }
        }

        // معالجة الأدوية المذكورة
        if (medicines.Any())
        {
            response.Add("💊 **معلومات عن الأدوية المذكورة:**");
            response.Add("");
            foreach (var medicine in medicines.Take(2))
            {
                if (_medicines.ContainsKey(medicine))
                {
                    var info = _medicines[medicine];
                    response.Add($"🔸 **{medicine}:**");
                    response.Add($"   📌 الاستخدام: {info.Use}");
                    response.Add($"   📏 الجرعة: {info.TypicalDosage}");
                    response.Add($"   ⚠️ تحذيرات: {info.Warnings}");
                    response.Add("");
                }
            }
        }

        // ردود لمن يحتاج معلومات عامة
        if (!symptoms.Any() && !medicines.Any() && !lowerMessage.Contains("نوم") && !lowerMessage.Contains("حساسية"))
        {
            if (lowerMessage.Contains("مرحبا") || lowerMessage.Contains("اهلا") || lowerMessage.Contains("السلام"))
            {
                response.Add("مرحباً بك! 👋");
                response.Add("");
                response.Add("أنا مساعد الصيدلة الذكي، يمكنني مساعدتك في:");
                response.Add("• معلومات عن الأدوية الشائعة");
                response.Add("• نصائح للأعراض البسيطة");
                response.Add("• إرشادات صحية عامة");
                response.Add("• نصائح للنوم والحساسية");
                response.Add("");
                response.Add("ما هو استفسارك اليوم؟ 🤔");
                return string.Join("\n", response);
            }
            else
            {
                response.Add("💡 **للحصول على مساعدة أفضل:**");
                response.Add("• اذكر الأعراض التي تعاني منها");
                response.Add("• أو اسأل عن دواء محدد");
                response.Add("• أو اطلب نصائح عامة (مثل: نصائح النوم)");
                response.Add("");
                response.Add("مثال: \"أعاني من صداع\" أو \"ما هو الباراسيتامول؟\"");
            }
        }

        // رسالة تحذيرية وختام
        response.Add("");
        response.Add("🚨 **تذكير مهم:**");
        response.Add("هذه معلومات عامة للتوعية فقط ولا تغني عن:");
        response.Add("• استشارة الطبيب للتشخيص الدقيق");
        response.Add("• زيارة الصيدلي للمشورة الدوائية");
        response.Add("• قراءة نشرة الدواء قبل الاستعمال");
        response.Add("");
        response.Add("💡 في حالات الطوارئ، توجه للطبيب فوراً!");

        return string.Join("\n", response);
    }

    private Dictionary<string, PharmacyAdvice> InitializeKnowledgeBase()
    {
        return new Dictionary<string, PharmacyAdvice>
        {
            ["صداع"] = new PharmacyAdvice
            {
                GeneralAdvice = "اشرب كمية كافية من الماء، احصل على قسط من الراحة في مكان هادئ ومظلم",
                OverTheCounterMeds = ["باراسيتامول", "إيبوبروفين", "أسبرين"],
                WhenToSeeDoctor = "إذا استمر الصداع أكثر من 3 أيام أو كان شديداً ومفاجئاً"
            },
            
            ["حمي"] = new PharmacyAdvice
            {
                GeneralAdvice = "اشرب السوائل بكثرة، استريح، ضع كمادات باردة على الجبهة",
                OverTheCounterMeds = ["باراسيتامول", "إيبوبروفين"],
                WhenToSeeDoctor = "إذا تجاوزت الحرارة 39°م أو استمرت أكثر من 3 أيام"
            },
            
            ["سعال"] = new PharmacyAdvice
            {
                GeneralAdvice = "اشرب السوائل الدافئة، تناول العسل، تجنب المهيجات كالدخان",
                OverTheCounterMeds = ["شراب السعال", "أقراص استحلاب"],
                WhenToSeeDoctor = "إذا استمر أكثر من أسبوعين أو صاحبه دم أو حمى"
            },
            
            ["التهاب الحلق"] = new PharmacyAdvice
            {
                GeneralAdvice = "تغرغر بالماء الدافئ والملح، اشرب السوائل الدافئة",
                OverTheCounterMeds = ["أقراص استحلاب", "مضادات الالتهاب"],
                WhenToSeeDoctor = "إذا استمر أكثر من 3 أيام أو صاحبه صعوبة في البلع"
            },
            
            ["معده"] = new PharmacyAdvice
            {
                GeneralAdvice = "تجنب الأطعمة الحارة والدهنية، تناول وجبات صغيرة ومتكررة",
                OverTheCounterMeds = ["مضادات الحموضة", "أقراص الهضم"],
                WhenToSeeDoctor = "إذا كان الألم شديداً أو مصحوباً بقيء أو دم"
            },
            
            ["أرق"] = new PharmacyAdvice
            {
                GeneralAdvice = "حافظ على روتين نوم ثابت، تجنب الكافيين مساءً، مارس الاسترخاء قبل النوم",
                OverTheCounterMeds = ["شاي البابونج", "مكملات الميلاتونين"],
                WhenToSeeDoctor = "إذا استمر الأرق أكثر من 3 أسابيع أو أثر على حياتك اليومية"
            },
            
            ["حساسيه"] = new PharmacyAdvice
            {
                GeneralAdvice = "تجنب المواد المثيرة للحساسية، استخدم منظفات لطيفة، حافظ على نظافة المنزل",
                OverTheCounterMeds = ["لوراتادين", "سيتيريزين", "كريمات مضادة للحكة"],
                WhenToSeeDoctor = "إذا كان لديك صعوبة تنفس، تورم في الوجه، أو طفح منتشر"
            },
            
            ["اسنان"] = new PharmacyAdvice
            {
                GeneralAdvice = "اغسل أسنانك مرتين يومياً، استخدم خيط الأسنان، تجنب السكريات الزائدة",
                OverTheCounterMeds = ["غسول فم مضاد للبكتيريا", "مسكنات ألم خفيفة"],
                WhenToSeeDoctor = "راجع طبيب الأسنان كل 6 أشهر أو عند الألم الشديد"
            },
            
            ["ضغط"] = new PharmacyAdvice
            {
                GeneralAdvice = "قلل الملح، مارس الرياضة، تجنب التوتر، حافظ على وزن صحي",
                OverTheCounterMeds = ["لا توجد أدوية آمنة بدون وصفة طبية"],
                WhenToSeeDoctor = "ضروري مراجعة الطبيب فوراً لقياس وعلاج ضغط الدم"
            }
        };
    }

    private Dictionary<string, string[]> InitializeSymptoms()
    {
        return new Dictionary<string, string[]>
        {
            ["صداع"] = ["صداع", "راس", "رأس", "وجع راس", "الم راس"],
            ["حمي"] = ["حمي", "حراره", "سخونيه", "ارتفاع حراره"],
            ["سعال"] = ["سعال", "كحه", "كحة", "سعله"],
            ["التهاب الحلق"] = ["حلق", "زور", "التهاب حلق", "الم حلق"],
            ["معده"] = ["معده", "بطن", "الم معده", "وجع بطن", "مغص"],
            ["اسهال"] = ["اسهال", "اسهل", "براز سائل"],
            ["امساك"] = ["امساك", "عدم تبرز", "صعوبه اخراج"],
            ["غثيان"] = ["غثيان", "دوخه", "دوار", "قيء"],
            ["حساسيه"] = ["حساسيه", "طفح", "حكه", "احمرار"],
            ["أرق"] = ["أرق", "نوم", "منوم", "سهر", "لا استطيع النوم"],
            ["اسنان"] = ["اسنان", "ضرس", "اضراس", "الم اسنان", "وجع اسنان"],
            ["ضغط"] = ["ضغط", "ضغط دم", "ارتفاع ضغط", "انخفاض ضغط"]
        };
    }

    private Dictionary<string, MedicineInfo> InitializeMedicines()
    {
        return new Dictionary<string, MedicineInfo>
        {
            ["باراسيتامول"] = new MedicineInfo
            {
                Use = "مسكن للألم وخافض للحرارة",
                TypicalDosage = "500 مجم كل 6 ساعات (بحد أقصى 4 جرام يومياً)",
                Warnings = "تجنب مع أمراض الكبد، لا تتجاوز الجرعة المحددة",
                AlternativeNames = ["بنادول", "أدول", "تايلينول"]
            },
            
            ["ايبوبروفين"] = new MedicineInfo
            {
                Use = "مسكن للألم ومضاد للالتهاب وخافض للحرارة",
                TypicalDosage = "200-400 مجم كل 6-8 ساعات مع الطعام",
                Warnings = "تجنب مع قرحة المعدة وأمراض الكلى",
                AlternativeNames = ["بروفين", "نوروفين", "أدفيل"]
            }
        };
    }

    public enum QueryType
    {
        General,
        Symptom,
        Information,
        Dosage,
        Interaction
    }

    public class PharmacyAdvice
    {
        public string GeneralAdvice { get; set; } = "";
        public List<string> OverTheCounterMeds { get; set; } = new();
        public string WhenToSeeDoctor { get; set; } = "";
    }

    public class MedicineInfo
    {
        public string Use { get; set; } = "";
        public string TypicalDosage { get; set; } = "";
        public string Warnings { get; set; } = "";
        public List<string> AlternativeNames { get; set; } = new();
    }
} 