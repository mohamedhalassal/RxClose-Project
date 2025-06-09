namespace RxCloseAPI.Entities;

public sealed class User
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Role { get; set; } = "user"; // user, admin, superadmin
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
    public string Status { get; set; } = "active"; // active, inactive, banned
    public string? Avatar { get; set; }
    
    // Navigation properties
    public Pharmacy? Pharmacy { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
