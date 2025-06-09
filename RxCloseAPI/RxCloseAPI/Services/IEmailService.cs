namespace RxCloseAPI.Services;

public interface IEmailService
{
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetCode, string userName);
    Task<bool> SendPharmacyWelcomeEmailAsync(string toEmail, string pharmacyName, string ownerName, string email, string password);
    Task<bool> SendEmailAsync(string toEmail, string subject, string body);
} 