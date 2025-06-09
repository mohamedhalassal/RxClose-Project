using Microsoft.EntityFrameworkCore;
using RxCloseAPI.Entities;
using RxCloseAPI.DTOs;
using RxCloseAPI.Persistence;
using BCrypt.Net;
using System.Text.Json;

namespace RxCloseAPI.Services;

public class PharmacyService : IPharmacyService
{
    private readonly RxCloseDbContext _context;
    private readonly IEmailService _emailService;

    public PharmacyService(RxCloseDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<IEnumerable<Pharmacy>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.Pharmacies
                .Include(p => p.User)
                .Include(p => p.Products)
                .Include(p => p.Orders)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<Pharmacy?> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Pharmacies
            .Include(p => p.User)
            .Include(p => p.Products)
            .Include(p => p.Orders)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Pharmacy> AddAsync(Pharmacy pharmacy, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"Creating pharmacy: {pharmacy.Name} with email: {pharmacy.Email}");
        
        // Validate required fields
        if (string.IsNullOrWhiteSpace(pharmacy.Name))
            throw new ArgumentException("Pharmacy name is required");
        if (string.IsNullOrWhiteSpace(pharmacy.Email))
            throw new ArgumentException("Email is required");
        if (string.IsNullOrWhiteSpace(pharmacy.OwnerName))
            throw new ArgumentException("Owner name is required");

        // Check if pharmacy email already exists
        var existingPharmacy = await _context.Pharmacies
            .FirstOrDefaultAsync(p => p.Email == pharmacy.Email, cancellationToken);
        if (existingPharmacy != null)
            throw new ArgumentException("A pharmacy with this email already exists");

        // Set default values
        pharmacy.RegisteredAt = DateTime.UtcNow;
        pharmacy.Status = "pending";
        pharmacy.TotalProducts = 0;
        pharmacy.TotalOrders = 0;
        pharmacy.Revenue = 0;
        pharmacy.Rating = 4;
        pharmacy.Verified = false;
        pharmacy.ProfileCompleted = false;

        // Create a professional user email to avoid constraint conflicts
        var emailDomain = pharmacy.Email.Split('@')[1];
        var emailPrefix = pharmacy.Email.Split('@')[0];
        
        // Create a clear, professional user email
        var userEmail = $"{emailPrefix}.pharmacy.admin@{emailDomain}";
        var userName = $"{emailPrefix}.pharmacy.admin";

        // Check if this email already exists and add timestamp if needed
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == userEmail, cancellationToken);
        
        if (existingUser != null)
        {
            // If this professional email exists, add timestamp for uniqueness
            var timestamp = DateTime.Now.Ticks.ToString().Substring(10);
            userEmail = $"{emailPrefix}.pharmacy.admin.{timestamp}@{emailDomain}";
            userName = $"{emailPrefix}.pharmacy.admin.{timestamp}";
        }

        var newUser = new User
        {
            Name = pharmacy.OwnerName,
            Email = userEmail,
            Password = BCrypt.Net.BCrypt.HashPassword("12345678"),
            PhoneNumber = pharmacy.PhoneNumber ?? "",
            Location = $"{pharmacy.City}, {pharmacy.Address}",
            Role = "admin",
            Status = "Active",
            UserName = userName,
            CreatedAt = DateTime.UtcNow
        };

        Console.WriteLine($"Creating user with email: {newUser.Email}");

        try
        {
            // Create user first
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"User created with ID: {newUser.Id}");

            // Set pharmacy user ID and create pharmacy
            pharmacy.UserId = newUser.Id;
            _context.Pharmacies.Add(pharmacy);
            await _context.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"Pharmacy created with ID: {pharmacy.Id}");

            // Send welcome email (don't fail if this fails)
            try
            {
                await _emailService.SendPharmacyWelcomeEmailAsync(
                    pharmacy.Email, pharmacy.Name, pharmacy.OwnerName,
                    userEmail, "12345678");
                Console.WriteLine("Welcome email sent");
            }
            catch (Exception emailEx)
            {
                Console.WriteLine($"Email failed: {emailEx.Message}");
            }

            Console.WriteLine($"Successfully created pharmacy {pharmacy.Name} with user {userEmail}");
            return pharmacy;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database error: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            
            // If user was created but pharmacy failed, try to clean up
            if (newUser.Id > 0 && pharmacy.Id == 0)
            {
                try
                {
                    var userToRemove = await _context.Users.FindAsync(newUser.Id);
                    if (userToRemove != null)
                    {
                        _context.Users.Remove(userToRemove);
                        await _context.SaveChangesAsync(cancellationToken);
                        Console.WriteLine("Cleaned up user after pharmacy creation failed");
                    }
                }
                catch (Exception cleanupEx)
                {
                    Console.WriteLine($"Cleanup failed: {cleanupEx.Message}");
                }
            }
            
            throw new Exception($"Failed to create pharmacy: {ex.Message}", ex);
        }
    }

    public async Task<bool> UpdateAsync(int id, UpdatePharmacyDto updateDto, CancellationToken cancellationToken = default)
    {
        var pharmacy = await _context.Pharmacies.FindAsync(id);
        if (pharmacy == null) return false;

        // Only allow updating profile fields (core fields like name, email, etc. are protected)
        if (!string.IsNullOrEmpty(updateDto.LicenseNumber))
            pharmacy.LicenseNumber = updateDto.LicenseNumber;
        if (!string.IsNullOrEmpty(updateDto.BusinessHours))
            pharmacy.BusinessHours = updateDto.BusinessHours;
        if (!string.IsNullOrEmpty(updateDto.EmergencyNumber))
            pharmacy.EmergencyNumber = updateDto.EmergencyNumber;
        if (!string.IsNullOrEmpty(updateDto.Website))
            pharmacy.Website = updateDto.Website;
        if (updateDto.DeliveryRadius.HasValue)
            pharmacy.DeliveryRadius = updateDto.DeliveryRadius;
        if (updateDto.DeliveryFee.HasValue)
            pharmacy.DeliveryFee = updateDto.DeliveryFee;
        if (updateDto.AcceptsInsurance.HasValue)
            pharmacy.AcceptsInsurance = updateDto.AcceptsInsurance;
        if (!string.IsNullOrEmpty(updateDto.Description))
            pharmacy.Description = updateDto.Description;
        if (!string.IsNullOrEmpty(updateDto.Specializations))
            pharmacy.Specializations = updateDto.Specializations;
        if (updateDto.ProfileCompleted.HasValue)
            pharmacy.ProfileCompleted = updateDto.ProfileCompleted.Value;

        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<bool> AdminUpdateAsync(int id, AdminUpdatePharmacyDto updateDto, CancellationToken cancellationToken = default)
    {
        var pharmacy = await _context.Pharmacies.FindAsync(id);
        if (pharmacy == null) return false;

        // Admin can update all fields including core fields
        if (!string.IsNullOrEmpty(updateDto.Name))
            pharmacy.Name = updateDto.Name;
        if (!string.IsNullOrEmpty(updateDto.Email))
            pharmacy.Email = updateDto.Email;
        if (!string.IsNullOrEmpty(updateDto.PhoneNumber))
            pharmacy.PhoneNumber = updateDto.PhoneNumber;
        if (!string.IsNullOrEmpty(updateDto.Address))
            pharmacy.Address = updateDto.Address;
        if (!string.IsNullOrEmpty(updateDto.City))
            pharmacy.City = updateDto.City;
        if (!string.IsNullOrEmpty(updateDto.Status))
            pharmacy.Status = updateDto.Status;
        if (updateDto.Verified.HasValue)
            pharmacy.Verified = updateDto.Verified.Value;

        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var pharmacy = await _context.Pharmacies.FindAsync(id);
        if (pharmacy == null) return false;

        _context.Pharmacies.Remove(pharmacy);
        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default)
    {
        var pharmacy = await _context.Pharmacies.FindAsync(id);
        if (pharmacy == null) return false;

        pharmacy.Status = status;
        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<bool> VerifyPharmacyAsync(int id, CancellationToken cancellationToken = default)
    {
        var pharmacy = await _context.Pharmacies.FindAsync(id);
        if (pharmacy == null) return false;

        pharmacy.Verified = true;
        pharmacy.Status = "active";
        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<object> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var total = await _context.Pharmacies.CountAsync(cancellationToken);
        var active = await _context.Pharmacies.CountAsync(p => p.Status == "active", cancellationToken);
        var pending = await _context.Pharmacies.CountAsync(p => p.Status == "pending", cancellationToken);
        var verified = await _context.Pharmacies.CountAsync(p => p.Verified, cancellationToken);

        return new { Total = total, Active = active, Pending = pending, Verified = verified };
    }
} 