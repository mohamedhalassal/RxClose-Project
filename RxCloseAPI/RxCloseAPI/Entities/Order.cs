namespace RxCloseAPI.Entities;

public sealed class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "pending"; // pending, confirmed, processing, shipped, delivered, cancelled
    public decimal TotalAmount { get; set; }
    public decimal ShippingCost { get; set; } = 0;
    public decimal TaxAmount { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = "pending"; // pending, completed, failed, refunded
    public string DeliveryAddress { get; set; } = string.Empty;
    public string? DeliveryNotes { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public string? TrackingNumber { get; set; }
    
    // Navigation properties
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int PharmacyId { get; set; }
    public Pharmacy Pharmacy { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
} 