namespace RxCloseAPI.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool Prescription { get; set; }
    public string? Manufacturer { get; set; }
    public string? ActiveIngredient { get; set; }
    public string? Dosage { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    // Seller information
    public string SellerType { get; set; } = string.Empty; // "pharmacy" or "rxclose"
    public string? SellerName { get; set; } // Pharmacy name or "RxClose"
    public int? PharmacyId { get; set; } // Nullable for RxClose products
    public string? PharmacyName { get; set; } // Only for pharmacy products
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public bool Prescription { get; set; }
    public string? Manufacturer { get; set; }
    public string? ActiveIngredient { get; set; }
    public string? Dosage { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    // Seller information - will be set based on who creates the product
    public string SellerType { get; set; } = "pharmacy"; // Default to pharmacy
    public int? PharmacyId { get; set; } // Required for pharmacy products, null for RxClose products
}

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
    public string? Status { get; set; }
    public string? ImageUrl { get; set; }
    public bool? Prescription { get; set; }
    public string? Manufacturer { get; set; }
    public string? ActiveIngredient { get; set; }
    public string? Dosage { get; set; }
    public DateTime? ExpiryDate { get; set; }
} 