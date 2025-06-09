using RxCloseAPI.Entities;
using RxCloseAPI.Persistence;
using Microsoft.EntityFrameworkCore;

namespace RxCloseAPI.Services;

public class PasswordResetService : IPasswordResetService
{
    private readonly RxCloseDbContext _context;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(RxCloseDbContext context, ILogger<PasswordResetService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PasswordReset?> CreateResetRequestAsync(string email, string ipAddress)
    {
        try
        {
            // Cleanup expired requests first
            await CleanupExpiredRequestsAsync();

            // Generate 6-digit code
            var random = new Random();
            var resetCode = random.Next(100000, 999999).ToString();

            var resetRequest = new PasswordReset
            {
                Email = email.ToLower(),
                ResetCode = resetCode,
                CreatedAt = DateTime.Now,
                ExpiresAt = DateTime.Now.AddMinutes(15),
                IsUsed = false,
                IpAddress = ipAddress
            };

            _context.PasswordResets.Add(resetRequest);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Password reset request created for email: {email}");
            return resetRequest;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating password reset request for email: {email}");
            return null;
        }
    }

    public async Task<PasswordReset?> GetValidResetRequestAsync(string email, string resetCode)
    {
        try
        {
            var resetRequest = await _context.PasswordResets
                .Where(r => r.Email.ToLower() == email.ToLower() && 
                           r.ResetCode == resetCode && 
                           !r.IsUsed && 
                           r.ExpiresAt > DateTime.Now)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            return resetRequest;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting reset request for email: {email}");
            return null;
        }
    }

    public async Task<bool> UseResetCodeAsync(int resetId)
    {
        try
        {
            var resetRequest = await _context.PasswordResets.FindAsync(resetId);
            if (resetRequest != null)
            {
                resetRequest.IsUsed = true;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Reset code marked as used for ID: {resetId}");
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error marking reset code as used for ID: {resetId}");
            return false;
        }
    }

    public async Task CleanupExpiredRequestsAsync()
    {
        try
        {
            var expiredRequests = await _context.PasswordResets
                .Where(r => r.ExpiresAt <= DateTime.Now || r.IsUsed)
                .ToListAsync();

            if (expiredRequests.Any())
            {
                _context.PasswordResets.RemoveRange(expiredRequests);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Cleaned up {expiredRequests.Count} expired/used reset requests");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired reset requests");
        }
    }
} 