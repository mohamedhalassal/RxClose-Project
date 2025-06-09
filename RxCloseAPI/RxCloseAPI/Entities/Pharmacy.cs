namespace RxCloseAPI.Entities;

public sealed class Pharmacy
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // active, pending, suspended
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public int TotalProducts { get; set; } = 0;
    public int TotalOrders { get; set; } = 0;
    public decimal Revenue { get; set; } = 0;
    public double Rating { get; set; } = 4.0;
    public bool Verified { get; set; } = false;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Additional profile fields
    public string? LicenseNumber { get; set; }
    public string? BusinessHours { get; set; }
    public string? EmergencyNumber { get; set; }
    public string? Website { get; set; }
    public double? DeliveryRadius { get; set; }
    public decimal? DeliveryFee { get; set; }
    public bool? AcceptsInsurance { get; set; }
    public string? Description { get; set; }
    public string? Specializations { get; set; } // Store as comma-separated string
    public bool ProfileCompleted { get; set; } = false;
    
    // Navigation properties
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
} 