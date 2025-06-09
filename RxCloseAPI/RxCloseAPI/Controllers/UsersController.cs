using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using RxCloseAPI.Services;
using RxCloseAPI.Entities;
using RxCloseAPI.Conntracts.Requests;
using RxCloseAPI.Conntracts.Responses;
using RxCloseAPI.DTOs;
using Mapster;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BCrypt.Net;

namespace RxCloseAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IPasswordResetService _passwordResetService;

    public UsersController(IUserService userService, IJwtService jwtService, IConfiguration configuration, 
                          IEmailService emailService, IPasswordResetService passwordResetService)
    {
        _userService = userService;
        _jwtService = jwtService;
        _configuration = configuration;
        _emailService = emailService;
        _passwordResetService = passwordResetService;
    }

    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hashedPassword)
    {
        try
        {
            // First try BCrypt (for new passwords)
            if (hashedPassword.StartsWith("$2a$") || hashedPassword.StartsWith("$2b$") || hashedPassword.StartsWith("$2y$"))
            {
                Console.WriteLine("Using BCrypt verification for password");
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            else
            {
                // Fallback to SHA256 (for legacy passwords)
                Console.WriteLine("Using SHA256 verification for legacy password");
                using (var sha256 = SHA256.Create())
                {
                    var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                    var sha256Hash = Convert.ToBase64String(hashedBytes);
                    return sha256Hash == hashedPassword;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Password verification error: {ex.Message}");
            return false;
        }
    }


     
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var users = await _userService.GetAllAsync(cancellationToken);
            
            // Simple response without complex mapping
            var response = users.Select(user => new {
                id = user.Id,
                name = user.Name ?? "Unknown",
                email = user.Email ?? "",
                role = user.Role ?? "user",
                status = user.Status ?? "active",
                createdAt = user.CreatedAt == DateTime.MinValue ? DateTime.UtcNow.ToString("yyyy-MM-dd") : user.CreatedAt.ToString("yyyy-MM-dd"),
                lastLogin = user.LastLogin?.ToString("yyyy-MM-dd") ?? "Never",
                avatar = $"https://via.placeholder.com/40x40?text={(user.Name ?? "U").Substring(0, Math.Min(2, (user.Name ?? "U").Length)).ToUpper()}",
                phoneNumber = user.PhoneNumber ?? "",
                userName = user.UserName ?? "",
                location = user.Location ?? ""
            }).ToList();
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAll: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetAsync(id, cancellationToken);

        if (user is null)
            return NotFound();

        var response = new UserResponse(
            user.Id,
            user.PhoneNumber ?? "",
            user.Name ?? "",
            user.UserName ?? "",
            user.Email ?? "",
            user.Location ?? "",
            user.Role ?? "user",
            user.CreatedAt == DateTime.MinValue ? DateTime.UtcNow : user.CreatedAt,
            user.LastLogin,
            user.Status ?? "active",
            user.Avatar ?? ""
        );
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] UserRequest request, CancellationToken cancellationToken)
    {
        var user = request.Adapt<User>();
        user.Password = HashPassword(user.Password); // Hash password before saving
        var newUser = await _userService.AddAsync(user, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = newUser.Id }, newUser);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRequest request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Registration attempt for email: {request.Email}");
        Console.WriteLine($"Request body: {JsonSerializer.Serialize(request)}");
        
        // Check if user already exists
        var existingUser = await _userService.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
        {
            Console.WriteLine($"User already exists with email: {request.Email}");
            return BadRequest(new { message = "User with this email already exists" });
        }

        var user = request.Adapt<User>();
        user.Password = HashPassword(user.Password); // Hash password before saving
        
        // Set default role if not provided
        if (string.IsNullOrEmpty(user.Role))
        {
            user.Role = "user";
        }
        
        var newUser = await _userService.AddAsync(user, cancellationToken);
        
        // Generate JWT token for immediate login after registration
        var token = _jwtService.GenerateToken(newUser);
        
        var newUserResponse = new UserResponse(
            newUser.Id,
            newUser.PhoneNumber,
            newUser.Name,
            newUser.UserName,
            newUser.Email,
            newUser.Location,
            newUser.Role,
            newUser.CreatedAt,
            newUser.LastLogin,
            newUser.Status,
            newUser.Avatar
        );
        
        var response = new
        {
            message = "Registration successful",
            token,
            user = newUserResponse,
            isAdmin = newUser.Role?.ToLower() == "admin" || newUser.Role?.ToLower() == "superadmin",
            role = newUser.Role?.ToLower(),
            expiresAt = DateTime.Now.AddMinutes(Convert.ToInt32(_configuration["Jwt:DurationInMinutes"]))
        };

        Console.WriteLine($"Registration successful for user: {newUser.Email}, Role: {newUser.Role}");
        return CreatedAtAction(nameof(Get), new { id = newUser.Id }, response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Login attempt for email: {request.Email}");
        Console.WriteLine($"Request body: {JsonSerializer.Serialize(request)}");
        
        var user = await _userService.GetByEmailAsync(request.Email, cancellationToken);

        if (user == null)
        {
            Console.WriteLine($"No user found with email: {request.Email}");
            return Unauthorized(new { message = "Invalid email or password" });
        }

        Console.WriteLine($"Found user: {user.Email}, Role: {user.Role}");
        
        // Verify password
        if (!VerifyPassword(request.Password, user.Password))
        {
            Console.WriteLine("Password mismatch");
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Upgrade legacy SHA256 password to BCrypt if needed
        if (!user.Password.StartsWith("$2a$") && !user.Password.StartsWith("$2b$") && !user.Password.StartsWith("$2y$"))
        {
            Console.WriteLine("Upgrading legacy password to BCrypt");
            try
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _userService.UpdateAsync(user.Id, user, cancellationToken);
                Console.WriteLine("Password upgraded successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to upgrade password: {ex.Message}");
                // Continue with login even if upgrade fails
            }
        }

        // Generate JWT token using service
        var token = _jwtService.GenerateToken(user);

        var userResponse = new UserResponse(
            user.Id,
            user.PhoneNumber,
            user.Name,
            user.UserName,
            user.Email,
            user.Location,
            user.Role,
            user.CreatedAt,
            user.LastLogin,
            user.Status,
            user.Avatar
        );
        
        var response = new
        {
            token,
            user = userResponse,
            isAdmin = user.Role?.ToLower() == "admin" || user.Role?.ToLower() == "superadmin",
            role = user.Role?.ToLower(),
            expiresAt = DateTime.Now.AddMinutes(Convert.ToInt32(_configuration["Jwt:DurationInMinutes"]))
        };

        Console.WriteLine($"Login successful for user: {user.Email}, Role: {user.Role}");
        Console.WriteLine($"Response: {JsonSerializer.Serialize(response)}");
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UserRequest request, CancellationToken cancellationToken)
    {
        var isUpdated = await _userService.UpdateAsync(id, request.Adapt<User>(), cancellationToken);

        if (!isUpdated)
            return NotFound();

        return NoContent(); 
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var isDeleted = await _userService.DeleteAsync(id, cancellationToken);

        if (!isDeleted)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole([FromRoute] int id, [FromBody] RoleUpdateRequest request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Updating role for user ID: {id}");
        Console.WriteLine($"New role: {request.Role}");
        
        var user = await _userService.GetAsync(id, cancellationToken);
        if (user == null)
        {
            Console.WriteLine($"No user found with ID: {id}");
            return NotFound();
        }

        Console.WriteLine($"Current user data: {JsonSerializer.Serialize(user)}");
        
        user.Role = request.Role;
        var isUpdated = await _userService.UpdateAsync(id, user, cancellationToken);

        if (!isUpdated)
        {
            Console.WriteLine($"Failed to update user with ID: {id}");
            return NotFound();
        }

        Console.WriteLine($"Role updated successfully for user ID: {id}");
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Forgot password request for email: {request.Email}");
            
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "يرجى إدخال البريد الإلكتروني" 
                });
            }

            // Check if user exists
            var user = await _userService.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                // For security, we don't reveal if email exists or not
                return Ok(new ForgotPasswordResponse 
                { 
                    Success = true, 
                    Message = "إذا كان البريد الإلكتروني مسجل لدينا، ستصلك رسالة تحتوي على رمز استرداد كلمة المرور",
                    Email = request.Email
                });
            }

            // Get client IP
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

            // Create reset request
            var resetRequest = await _passwordResetService.CreateResetRequestAsync(request.Email, ipAddress);
            if (resetRequest == null)
            {
                return StatusCode(500, new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "حدث خطأ في النظام. يرجى المحاولة لاحقاً" 
                });
            }

            // Send email
            var emailSent = await _emailService.SendPasswordResetEmailAsync(
                request.Email, 
                resetRequest.ResetCode, 
                user.Name
            );

            if (emailSent)
            {
                Console.WriteLine($"Password reset email sent successfully to: {request.Email}");
                return Ok(new ForgotPasswordResponse 
                { 
                    Success = true, 
                    Message = "تم إرسال رمز استرداد كلمة المرور إلى بريدك الإلكتروني. الرمز صالح لمدة 15 دقيقة",
                    Email = request.Email
                });
            }
            else
            {
                Console.WriteLine($"Failed to send password reset email to: {request.Email}");
                return StatusCode(500, new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً" 
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in forgot password: {ex.Message}");
            return StatusCode(500, new ForgotPasswordResponse 
            { 
                Success = false, 
                Message = "حدث خطأ في النظام. يرجى المحاولة لاحقاً" 
            });
        }
    }

    [HttpPost("verify-reset-code")]
    public async Task<IActionResult> VerifyResetCode([FromBody] VerifyResetCodeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Verifying reset code for email: {request.Email}");
            
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.ResetCode))
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "يرجى إدخال البريد الإلكتروني ورمز التحقق" 
                });
            }

            var resetRequest = await _passwordResetService.GetValidResetRequestAsync(request.Email, request.ResetCode);
            if (resetRequest == null)
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "رمز التحقق غير صحيح أو منتهي الصلاحية" 
                });
            }

            Console.WriteLine($"Reset code verified successfully for email: {request.Email}");
            return Ok(new ForgotPasswordResponse 
            { 
                Success = true, 
                Message = "رمز التحقق صحيح. يمكنك الآن تغيير كلمة المرور",
                Email = request.Email
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in verify reset code: {ex.Message}");
            return StatusCode(500, new ForgotPasswordResponse 
            { 
                Success = false, 
                Message = "حدث خطأ في النظام. يرجى المحاولة لاحقاً" 
            });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Resetting password for email: {request.Email}");
            
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.ResetCode) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "جميع الحقول مطلوبة" 
                });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "كلمة المرور يجب أن تكون على الأقل 6 أحرف" 
                });
            }

            // Verify reset code
            var resetRequest = await _passwordResetService.GetValidResetRequestAsync(request.Email, request.ResetCode);
            if (resetRequest == null)
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "رمز التحقق غير صحيح أو منتهي الصلاحية" 
                });
            }

            // Get user
            var user = await _userService.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                return BadRequest(new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "المستخدم غير موجود" 
                });
            }

            // Update password
            user.Password = HashPassword(request.NewPassword);
            var isUpdated = await _userService.UpdateAsync(user.Id, user, cancellationToken);
            
            if (isUpdated)
            {
                // Mark reset code as used
                await _passwordResetService.UseResetCodeAsync(resetRequest.Id);
                
                Console.WriteLine($"Password reset successfully for email: {request.Email}");
                return Ok(new ForgotPasswordResponse 
                { 
                    Success = true, 
                    Message = "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
                    Email = request.Email
                });
            }
            else
            {
                return StatusCode(500, new ForgotPasswordResponse 
                { 
                    Success = false, 
                    Message = "حدث خطأ في تحديث كلمة المرور" 
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in reset password: {ex.Message}");
            return StatusCode(500, new ForgotPasswordResponse 
            { 
                Success = false, 
                Message = "حدث خطأ في النظام. يرجى المحاولة لاحقاً" 
            });
        }
    }
}

public class RoleUpdateRequest
{
    public string Role { get; set; } = string.Empty;
}
