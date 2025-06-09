using RxCloseAPI.Entities;

namespace RxCloseAPI.Services;

public interface IPasswordResetService
{
    Task<PasswordReset?> CreateResetRequestAsync(string email, string ipAddress);
    Task<PasswordReset?> GetValidResetRequestAsync(string email, string resetCode);
    Task<bool> UseResetCodeAsync(int resetId);
    Task CleanupExpiredRequestsAsync();
} 