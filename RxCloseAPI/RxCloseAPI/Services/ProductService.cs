using Microsoft.EntityFrameworkCore;
using RxCloseAPI.Entities;
using RxCloseAPI.DTOs;
using RxCloseAPI.Persistence;

namespace RxCloseAPI.Services;

public class ProductService : IProductService
{
    private readonly RxCloseDbContext _context;

    public ProductService(RxCloseDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllAsync(string? category = null, string? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Pharmacy)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetRxCloseProductsAsync(string? category = null, string? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Where(p => p.SellerType == "rxclose")
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetPharmacyProductsAsync(string? category = null, string? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Pharmacy)
            .Where(p => p.SellerType == "pharmacy")
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Pharmacy)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Pharmacy)
            .Where(p => p.PharmacyId == pharmacyId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        // Set seller name if it's a pharmacy product
        if (product.SellerType == "pharmacy" && product.PharmacyId.HasValue)
        {
            var pharmacy = await _context.Pharmacies.FindAsync(product.PharmacyId.Value);
            if (pharmacy != null)
            {
                product.SellerName = pharmacy.Name;
            }
        }
        
        Console.WriteLine($"Adding product: {product.Name}, SellerType: {product.SellerType}, SellerName: {product.SellerName}, PharmacyId: {product.PharmacyId}");
        
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Load the pharmacy if it exists
        if (product.PharmacyId.HasValue)
        {
            await _context.Entry(product)
                .Reference(p => p.Pharmacy)
                .LoadAsync(cancellationToken);
        }
        
        return product;
    }

    public async Task<bool> UpdateAsync(int id, UpdateProductDto updateDto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        if (!string.IsNullOrEmpty(updateDto.Name))
            product.Name = updateDto.Name;
        if (!string.IsNullOrEmpty(updateDto.Category))
            product.Category = updateDto.Category;
        if (!string.IsNullOrEmpty(updateDto.Description))
            product.Description = updateDto.Description;
        if (updateDto.Price.HasValue)
            product.Price = updateDto.Price.Value;
        if (updateDto.Stock.HasValue)
            product.Stock = updateDto.Stock.Value;
        if (!string.IsNullOrEmpty(updateDto.Status))
            product.Status = updateDto.Status;
        if (!string.IsNullOrEmpty(updateDto.ImageUrl))
            product.ImageUrl = updateDto.ImageUrl;
        if (updateDto.Prescription.HasValue)
            product.Prescription = updateDto.Prescription.Value;
        if (!string.IsNullOrEmpty(updateDto.Manufacturer))
            product.Manufacturer = updateDto.Manufacturer;
        if (!string.IsNullOrEmpty(updateDto.ActiveIngredient))
            product.ActiveIngredient = updateDto.ActiveIngredient;
        if (!string.IsNullOrEmpty(updateDto.Dosage))
            product.Dosage = updateDto.Dosage;
        if (updateDto.ExpiryDate.HasValue)
            product.ExpiryDate = updateDto.ExpiryDate;

        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        var rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<object> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        var activeProducts = await _context.Products.CountAsync(p => p.Status == "active", cancellationToken);
        var categories = await _context.Products.Select(p => p.Category).Distinct().CountAsync(cancellationToken);
        var totalValue = await _context.Products.SumAsync(p => p.Price * p.Stock, cancellationToken);
        var lowStockProducts = await _context.Products.CountAsync(p => p.Stock < 10, cancellationToken);
        var prescriptionProducts = await _context.Products.CountAsync(p => p.Prescription, cancellationToken);

        return new
        {
            totalProducts,
            activeProducts,
            categories,
            totalValue,
            lowStockProducts,
            prescriptionProducts
        };
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Select(p => p.Category)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Pharmacy)
            .Where(p => p.Name.Contains(query) || 
                       p.Description.Contains(query) || 
                       p.Category.Contains(query) ||
                       (p.Manufacturer != null && p.Manufacturer.Contains(query)) ||
                       (p.ActiveIngredient != null && p.ActiveIngredient.Contains(query)))
            .ToListAsync(cancellationToken);
    }
}