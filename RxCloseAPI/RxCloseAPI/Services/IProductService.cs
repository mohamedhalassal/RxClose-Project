using RxCloseAPI.Entities;
using RxCloseAPI.DTOs;

namespace RxCloseAPI.Services;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllAsync(string? category = null, string? status = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetRxCloseProductsAsync(string? category = null, string? status = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetPharmacyProductsAsync(string? category = null, string? status = null, CancellationToken cancellationToken = default);
    Task<Product?> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, UpdateProductDto product, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<object> GetStatisticsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> SearchAsync(string query, CancellationToken cancellationToken = default);
    Task<IEnumerable<object>> SearchNearbyAsync(string query, double userLatitude, double userLongitude, double maxDistanceKm = 50, CancellationToken cancellationToken = default);
} 