using System.Net;
using System.Net.Mail;

namespace RxCloseAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetCode, string userName)
    {
        var subject = "🔐 استرداد كلمة المرور - RxClose";
        
        var body = $@"
            <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;'>
                <div style='background: white; padding: 30px; border-radius: 10px; border: 1px solid #ddd;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h1 style='color: #2c5aa0; margin-bottom: 10px;'>🏥 RxClose</h1>
                        <h2 style='color: #333; font-size: 24px; margin: 0;'>استرداد كلمة المرور</h2>
                    </div>
                    
                    <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <p style='font-size: 16px; color: #333; margin: 0 0 15px 0;'>مرحباً <strong>{userName}</strong>,</p>
                        <p style='font-size: 16px; color: #333; margin: 0 0 15px 0;'>تلقينا طلباً لاسترداد كلمة المرور الخاصة بحسابك في RxClose.</p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <div style='background: #2c5aa0; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 3px; display: inline-block; min-width: 200px;'>
                            {resetCode}
                        </div>
                        <p style='color: #666; font-size: 14px; margin-top: 10px;'>رمز التحقق صالح لمدة 15 دقيقة فقط</p>
                    </div>
                    
                    <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p style='color: #856404; margin: 0; font-size: 14px;'>
                            <strong>⚠️ تنبيه أمني:</strong> إذا لم تطلب استرداد كلمة المرور، يرجى تجاهل هذا الإيميل.
                        </p>
                    </div>
                    
                    <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #666; font-size: 12px; margin: 0;'>© 2025 RxClose - نظام إدارة الصيدليات</p>
                        <p style='color: #666; font-size: 12px; margin: 5px 0 0 0;'>هذا إيميل تلقائي، يرجى عدم الرد عليه</p>
                    </div>
                </div>
            </div>";

        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendPharmacyWelcomeEmailAsync(string toEmail, string pharmacyName, string ownerName, string email, string password)
    {
        var subject = "🎉 مرحباً بك في RxClose - بيانات دخول الصيدلية";
        
        var body = $@"
            <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;'>
                <div style='background: white; padding: 30px; border-radius: 10px; border: 1px solid #ddd;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h1 style='color: #2c5aa0; margin-bottom: 10px;'>🏥 RxClose</h1>
                        <h2 style='color: #333; font-size: 24px; margin: 0;'>مرحباً بك في منصة RxClose</h2>
                    </div>
                    
                    <div style='background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                        <p style='font-size: 18px; color: #333; margin: 0 0 15px 0; text-align: center;'>🎊 <strong>مبروك!</strong> 🎊</p>
                        <p style='font-size: 16px; color: #333; margin: 0 0 15px 0;'>مرحباً <strong>{ownerName}</strong>,</p>
                        <p style='font-size: 16px; color: #333; margin: 0 0 15px 0;'>تم إنشاء حساب صيدلية <strong>{pharmacyName}</strong> بنجاح في منصة RxClose!</p>
                        <p style='font-size: 16px; color: #333; margin: 0;'>يمكنك الآن الدخول إلى لوحة تحكم الصيدلية وإدارة المنتجات والطلبات.</p>
                    </div>
                    
                    <div style='background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #2c5aa0;'>
                        <h3 style='color: #2c5aa0; margin: 0 0 20px 0; text-align: center;'>🔑 بيانات الدخول إلى لوحة التحكم</h3>
                        
                        <div style='margin-bottom: 15px;'>
                            <strong style='color: #495057; display: inline-block; width: 120px;'>البريد الإلكتروني:</strong>
                            <span style='background: #e9ecef; padding: 8px 12px; border-radius: 4px; font-family: monospace; color: #2c5aa0; font-weight: bold;'>{email}</span>
                        </div>
                        
                        <div style='margin-bottom: 15px;'>
                            <strong style='color: #495057; display: inline-block; width: 120px;'>كلمة المرور:</strong>
                            <span style='background: #ffe6e6; padding: 8px 12px; border-radius: 4px; font-family: monospace; color: #dc3545; font-weight: bold; font-size: 18px;'>{password}</span>
                        </div>
                        
                        <div style='margin-bottom: 15px;'>
                            <strong style='color: #495057; display: inline-block; width: 120px;'>الدور:</strong>
                            <span style='background: #d4edda; padding: 8px 12px; border-radius: 4px; color: #155724; font-weight: bold;'>مدير صيدلية (Admin)</span>
                        </div>
                        
                        <div style='text-align: center; margin-top: 25px;'>
                            <a href='http://localhost:4200/login' style='background: linear-gradient(135deg, #2c5aa0 0%, #1e3d72 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(44, 90, 160, 0.3);'>
                                🚀 دخول إلى لوحة التحكم
                            </a>
                        </div>
                    </div>
                    
                    <div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <h4 style='color: #0c5460; margin: 0 0 15px 0;'>📋 ملخص بيانات الصيدلية:</h4>
                        <ul style='color: #0c5460; font-size: 14px; margin: 0; padding-left: 20px; list-style: none;'>
                            <li style='margin-bottom: 8px;'><strong>🏪 اسم الصيدلية:</strong> {pharmacyName}</li>
                            <li style='margin-bottom: 8px;'><strong>👤 اسم المالك:</strong> {ownerName}</li>
                            <li style='margin-bottom: 8px;'><strong>📧 البريد الإلكتروني:</strong> {email}</li>
                            <li style='margin-bottom: 8px;'><strong>🎯 الحالة:</strong> في انتظار الموافقة</li>
                            <li style='margin-bottom: 8px;'><strong>✅ التحقق:</strong> سيتم التحقق قريباً</li>
                        </ul>
                    </div>
                    
                    <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p style='color: #856404; margin: 0; font-size: 14px;'>
                            <strong>🔒 نصائح أمنية هامة:</strong>
                        </p>
                        <ul style='color: #856404; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;'>
                            <li>يُنصح بتغيير كلمة المرور فوراً بعد أول تسجيل دخول</li>
                            <li>لا تشارك بيانات الدخول مع أي شخص آخر</li>
                            <li>استخدم كلمة مرور قوية تحتوي على أرقام وحروف ورموز</li>
                            <li>احفظ هذا البريد في مكان آمن للرجوع إليه</li>
                        </ul>
                    </div>
                    
                    <div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        <p style='color: #0c5460; margin: 0; font-size: 14px;'>
                            <strong>📋 الخطوات التالية:</strong>
                        </p>
                        <ol style='color: #0c5460; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;'>
                            <li>تسجيل الدخول إلى حسابك باستخدام البيانات أعلاه</li>
                            <li>تغيير كلمة المرور إلى كلمة أكثر أماناً</li>
                            <li>إكمال معلومات ملف الصيدلية الشخصي</li>
                            <li>إضافة منتجات الصيدلية والأدوية</li>
                            <li>تحديث ساعات العمل ومعلومات التوصيل</li>
                            <li>بدء استقبال وإدارة الطلبات من العملاء</li>
                        </ol>
                    </div>
                    
                    <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #666; font-size: 12px; margin: 0;'>© 2025 RxClose - منصة إدارة الصيدليات الرائدة في المنطقة</p>
                        <p style='color: #666; font-size: 12px; margin: 5px 0 0 0;'>هذا إيميل تلقائي، يرجى عدم الرد عليه</p>
                        <p style='color: #666; font-size: 12px; margin: 5px 0 0 0;'>للدعم التقني أو الاستفسارات: support@rxclose.com</p>
                    </div>
                </div>
            </div>";

        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var fromEmail = _configuration["Email:FromEmail"] ?? "";
            var fromPassword = _configuration["Email:FromPassword"] ?? "";

            if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(fromPassword))
            {
                _logger.LogWarning("Email configuration is missing. Using mock email service.");
                
                // Mock email for development
                _logger.LogInformation($"MOCK EMAIL SENT TO: {toEmail}");
                _logger.LogInformation($"SUBJECT: {subject}");
                _logger.LogInformation($"BODY: {body}");
                
                // Simulate delay
                await Task.Delay(1000);
                return true;
            }

            using var client = new SmtpClient(smtpHost, smtpPort);
            client.EnableSsl = true;
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential(fromEmail, fromPassword);

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, "RxClose System"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            
            _logger.LogInformation($"Email sent successfully to {toEmail}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {toEmail}");
            return false;
        }
    }
} 