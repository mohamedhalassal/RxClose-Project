using System.Reflection;
using Microsoft.EntityFrameworkCore;
using RxCloseAPI.Entities;

namespace RxCloseAPI.Persistence;

public class RxCloseDbContext(DbContextOptions<RxCloseDbContext>options):DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Pharmacy> Pharmacies { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<PasswordReset> PasswordResets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Password).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UserName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(20).HasDefaultValue("user");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("active");

            // Add unique constraint for email
            entity.HasIndex(e => e.Email).IsUnique();
            
            // Relationships
            entity.HasOne(e => e.Pharmacy)
                  .WithOne(p => p.User)
                  .HasForeignKey<Pharmacy>(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasMany(e => e.Orders)
                  .WithOne(o => o.User)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Pharmacy entity
        modelBuilder.Entity<Pharmacy>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.OwnerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(200);
            entity.Property(e => e.City).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("pending");
            entity.Property(e => e.Revenue).HasColumnType("decimal(18,2)");
            
            // Add unique constraint for email
            entity.HasIndex(e => e.Email).IsUnique();
            
            // Relationships
            entity.HasMany(e => e.Products)
                  .WithOne(p => p.Pharmacy)
                  .HasForeignKey(p => p.PharmacyId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            entity.HasMany(e => e.Orders)
                  .WithOne(o => o.Pharmacy)
                  .HasForeignKey(o => o.PharmacyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Product entity
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("active");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Manufacturer).HasMaxLength(100);
            entity.Property(e => e.ActiveIngredient).HasMaxLength(200);
            entity.Property(e => e.Dosage).HasMaxLength(50);
            
            // Seller information
            entity.Property(e => e.SellerType).IsRequired().HasMaxLength(50).HasDefaultValue("pharmacy");
            entity.Property(e => e.SellerName).HasMaxLength(255);
            
            // Make PharmacyId nullable for RxClose products
            entity.Property(e => e.PharmacyId).IsRequired(false);
            
            // Relationships
            entity.HasMany(e => e.OrderItems)
                  .WithOne(oi => oi.Product)
                  .HasForeignKey(oi => oi.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Order entity
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("pending");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ShippingCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("pending");
            entity.Property(e => e.DeliveryAddress).IsRequired().HasMaxLength(300);
            entity.Property(e => e.DeliveryNotes).HasMaxLength(500);
            entity.Property(e => e.TrackingNumber).HasMaxLength(100);
            
            // Add unique constraint for order number
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            
            // Relationships
            entity.HasMany(e => e.OrderItems)
                  .WithOne(oi => oi.Order)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure OrderItem entity
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(200);
        });

        // Configure PasswordReset entity
        modelBuilder.Entity<PasswordReset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ResetCode).IsRequired().HasMaxLength(10);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.IsUsed).IsRequired().HasDefaultValue(false);
            
            // Index for faster lookups
            entity.HasIndex(e => new { e.Email, e.ResetCode });
            entity.HasIndex(e => e.ExpiresAt);
        });

        base.OnModelCreating(modelBuilder);
    }
}
