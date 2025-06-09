namespace RxCloseAPI.Entities;

public class PasswordReset
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string ResetCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime ExpiresAt { get; set; } = DateTime.Now.AddMinutes(15); // 15 minutes expiry
    public bool IsUsed { get; set; } = false;
    public string IpAddress { get; set; } = string.Empty;
} 