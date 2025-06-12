namespace RxCloseAPI.DTOs;

public class PharmacyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal Revenue { get; set; }
    public double Rating { get; set; }
    public bool Verified { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int UserId { get; set; }
    
    // Additional profile fields
    public string? LicenseNumber { get; set; }
    public string? BusinessHours { get; set; }
    public string? EmergencyNumber { get; set; }
    public string? Website { get; set; }
    public double? DeliveryRadius { get; set; }
    public decimal? DeliveryFee { get; set; }
    public bool? AcceptsInsurance { get; set; }
    public string? Description { get; set; }
    public string? Specializations { get; set; }
    public bool ProfileCompleted { get; set; }
}

public class CreatePharmacyDto
{
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? UserId { get; set; }
    
    // Additional profile fields for creation
    public string? LicenseNumber { get; set; }
    public string? BusinessHours { get; set; }
    public string? EmergencyNumber { get; set; }
    public string? Website { get; set; }
    public double? DeliveryRadius { get; set; }
    public decimal? DeliveryFee { get; set; }
    public bool? AcceptsInsurance { get; set; }
    public string? Description { get; set; }
    public string? Specializations { get; set; }
    public bool ProfileCompleted { get; set; } = false;
}

public class UpdatePharmacyDto
{
    // Core fields - can only be updated by admin/super admin
    // These fields are intentionally excluded from regular pharmacy owner updates
    
    // Profile fields that pharmacy owners can update
    public string? LicenseNumber { get; set; }
    public string? BusinessHours { get; set; }
    public string? EmergencyNumber { get; set; }
    public string? Website { get; set; }
    public double? DeliveryRadius { get; set; }
    public decimal? DeliveryFee { get; set; }
    public bool? AcceptsInsurance { get; set; }
    public string? Description { get; set; }
    public string? Specializations { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool? ProfileCompleted { get; set; }
}

// Separate DTO for admin updates that includes core fields
public class AdminUpdatePharmacyDto
{
    public string? Name { get; set; }
    public string? OwnerName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Status { get; set; }
    public bool? Verified { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Profile fields
    public string? LicenseNumber { get; set; }
    public string? BusinessHours { get; set; }
    public string? EmergencyNumber { get; set; }
    public string? Website { get; set; }
    public double? DeliveryRadius { get; set; }
    public decimal? DeliveryFee { get; set; }
    public bool? AcceptsInsurance { get; set; }
    public string? Description { get; set; }
    public string? Specializations { get; set; }
    public bool? ProfileCompleted { get; set; }
} 