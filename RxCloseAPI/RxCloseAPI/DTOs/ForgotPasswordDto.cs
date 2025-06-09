namespace RxCloseAPI.DTOs;

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class VerifyResetCodeRequest
{
    public string Email { get; set; } = string.Empty;
    public string ResetCode { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string ResetCode { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ForgotPasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Email { get; set; }
} 