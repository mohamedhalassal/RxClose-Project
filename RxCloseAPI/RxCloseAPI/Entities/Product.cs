namespace RxCloseAPI.Entities;

public sealed class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Status { get; set; } = "active"; // active, inactive
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool Prescription { get; set; } = false;
    public string? Manufacturer { get; set; }
    public string? ActiveIngredient { get; set; }
    public string? Dosage { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    // Seller information
    public string SellerType { get; set; } = "pharmacy"; // "pharmacy" or "rxclose"
    public string? SellerName { get; set; } // Pharmacy name or "RxClose"
    
    // Navigation properties
    public int? PharmacyId { get; set; } // Nullable for RxClose products
    public Pharmacy? Pharmacy { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
} 