using RxCloseAPI.Entities;
using RxCloseAPI.DTOs;

namespace RxCloseAPI.Services;

public interface IPharmacyService
{
    Task<IEnumerable<Pharmacy>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Pharmacy?> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Pharmacy> AddAsync(Pharmacy pharmacy, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, UpdatePharmacyDto pharmacy, CancellationToken cancellationToken = default);
    Task<bool> AdminUpdateAsync(int id, AdminUpdatePharmacyDto pharmacy, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default);
    Task<bool> VerifyPharmacyAsync(int id, CancellationToken cancellationToken = default);
    Task<object> GetStatisticsAsync(CancellationToken cancellationToken = default);
} 