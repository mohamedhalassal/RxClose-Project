using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RxCloseAPI.Persistence;

namespace RxCloseAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly RxCloseDbContext _context;

    public DashboardController(RxCloseDbContext context)
    {
        _context = context;
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var activeUsers = await _context.Users.CountAsync(u => u.Status == "active", cancellationToken);
        var pharmacyAdmins = await _context.Users.CountAsync(u => u.Role == "admin", cancellationToken);
        var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedAt.Month == DateTime.Now.Month && u.CreatedAt.Year == DateTime.Now.Year, cancellationToken);

        var totalPharmacies = await _context.Pharmacies.CountAsync(cancellationToken);
        var activePharmacies = await _context.Pharmacies.CountAsync(p => p.Status == "active", cancellationToken);
        var pendingPharmacies = await _context.Pharmacies.CountAsync(p => p.Status == "pending", cancellationToken);
        var verifiedPharmacies = await _context.Pharmacies.CountAsync(p => p.Verified, cancellationToken);

        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        var activeProducts = await _context.Products.CountAsync(p => p.Status == "active", cancellationToken);
        var lowStockProducts = await _context.Products.CountAsync(p => p.Stock < 10, cancellationToken);
        var prescriptionProducts = await _context.Products.CountAsync(p => p.Prescription, cancellationToken);

        var totalOrders = await _context.Orders.CountAsync(cancellationToken);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "pending", cancellationToken);
        var completedOrders = await _context.Orders.CountAsync(o => o.Status == "delivered", cancellationToken);
        var totalRevenue = await _context.Orders.Where(o => o.Status == "delivered").SumAsync(o => o.TotalAmount, cancellationToken);

        var categories = await _context.Products.Select(p => p.Category).Distinct().CountAsync(cancellationToken);

        var recentActivities = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Pharmacy)
            .OrderByDescending(o => o.OrderDate)
            .Take(10)
            .Select(o => new
            {
                id = o.Id,
                type = "order",
                description = $"طلب جديد من {o.User.Name} في {o.Pharmacy.Name}",
                date = o.OrderDate,
                status = o.Status,
                amount = o.TotalAmount
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            users = new
            {
                total = totalUsers,
                active = activeUsers,
                pharmacyAdmins = pharmacyAdmins,
                newThisMonth = newUsersThisMonth
            },
            pharmacies = new
            {
                total = totalPharmacies,
                active = activePharmacies,
                pending = pendingPharmacies,
                verified = verifiedPharmacies
            },
            products = new
            {
                total = totalProducts,
                active = activeProducts,
                lowStock = lowStockProducts,
                prescription = prescriptionProducts,
                categories = categories
            },
            orders = new
            {
                total = totalOrders,
                pending = pendingOrders,
                completed = completedOrders
            },
            revenue = new
            {
                total = totalRevenue,
                thisMonth = await _context.Orders
                    .Where(o => o.Status == "delivered" && 
                               o.OrderDate.Month == DateTime.Now.Month && 
                               o.OrderDate.Year == DateTime.Now.Year)
                    .SumAsync(o => o.TotalAmount, cancellationToken)
            },
            recentActivities = recentActivities
        });
    }

    [HttpGet("charts/revenue")]
    public async Task<IActionResult> GetRevenueChart(CancellationToken cancellationToken)
    {
        var last12Months = Enumerable.Range(0, 12)
            .Select(i => DateTime.Now.AddMonths(-i))
            .OrderBy(d => d)
            .ToList();

        var revenueData = new List<object>();

        foreach (var month in last12Months)
        {
            var revenue = await _context.Orders
                .Where(o => o.Status == "delivered" && 
                           o.OrderDate.Month == month.Month && 
                           o.OrderDate.Year == month.Year)
                .SumAsync(o => o.TotalAmount, cancellationToken);

            revenueData.Add(new
            {
                month = month.ToString("MMM yyyy"),
                revenue = revenue
            });
        }

        return Ok(revenueData);
    }

    [HttpGet("charts/orders")]
    public async Task<IActionResult> GetOrdersChart(CancellationToken cancellationToken)
    {
        var ordersByStatus = await _context.Orders
            .GroupBy(o => o.Status)
            .Select(g => new
            {
                status = g.Key,
                count = g.Count()
            })
            .ToListAsync(cancellationToken);

        return Ok(ordersByStatus);
    }

    [HttpGet("charts/products")]
    public async Task<IActionResult> GetProductsChart(CancellationToken cancellationToken)
    {
        var productsByCategory = await _context.Products
            .GroupBy(p => p.Category)
            .Select(g => new
            {
                category = g.Key,
                count = g.Count()
            })
            .ToListAsync(cancellationToken);

        return Ok(productsByCategory);
    }
} 