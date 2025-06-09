using Microsoft.AspNetCore.Mvc;
using RxCloseAPI.Services;
using RxCloseAPI.Entities;
using System.Text.Json;

namespace RxCloseAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPharmacyService _pharmacyService;
    private readonly IProductService _productService;

    public ReportsController(IUserService userService, IPharmacyService pharmacyService, IProductService productService)
    {
        _userService = userService;
        _pharmacyService = pharmacyService;
        _productService = productService;
    }

    [HttpGet("dashboard-statistics")]
    public async Task<IActionResult> GetDashboardStatistics(CancellationToken cancellationToken)
    {
        try
        {
            var users = await _userService.GetAllAsync();
            var pharmacies = await _pharmacyService.GetAllAsync();
            var products = await _productService.GetAllAsync();

            var statistics = new
            {
                totalUsers = users.Count(),
                totalPharmacies = pharmacies.Count(),
                totalProducts = products.Count(),
                totalRevenue = GenerateRandomRevenue(),
                totalOrders = GenerateRandomOrders(),
                activeUsers = users.Count(u => u.Status == "active"),
                usersByRole = users.GroupBy(u => u.Role).ToDictionary(g => g.Key, g => g.Count()),
                recentGrowth = new
                {
                    users = 15.3,
                    pharmacies = 8.7,
                    products = 12.1,
                    revenue = 23.5
                }
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting dashboard statistics: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving dashboard statistics" });
        }
    }

    [HttpGet("revenue-chart")]
    public IActionResult GetRevenueChart([FromQuery] string period = "30days")
    {
        try
        {
            var chartData = period switch
            {
                "7days" => new
                {
                    labels = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" },
                    data = new[] { 1200, 1900, 800, 1500, 2000, 1700, 1400 }
                },
                "30days" => new
                {
                    labels = GenerateDayLabels(30),
                    data = GenerateRevenueData(30)
                },
                "3months" => new
                {
                    labels = GenerateMonthLabels(3),
                    data = GenerateRevenueData(3)
                },
                "year" => new
                {
                    labels = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" },
                    data = GenerateRevenueData(12)
                },
                _ => new
                {
                    labels = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" },
                    data = new[] { 1200, 1900, 800, 1500, 2000, 1700, 1400 }
                }
            };

            return Ok(chartData);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting revenue chart: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving revenue chart data" });
        }
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] int limit = 5, CancellationToken cancellationToken = default)
    {
        try
        {
            var products = await _productService.GetAllAsync();
            var topProducts = products.Take(limit).Select(p => new
            {
                id = p.Id,
                name = p.Name,
                sales = GenerateRandomSales(),
                revenue = GenerateRandomRevenue() / 10,
                category = p.Category ?? "General"
            });

            return Ok(topProducts);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting top products: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving top products" });
        }
    }

    [HttpGet("top-pharmacies")]
    public async Task<IActionResult> GetTopPharmacies([FromQuery] int limit = 5, CancellationToken cancellationToken = default)
    {
        try
        {
            var pharmacies = await _pharmacyService.GetAllAsync();
            var topPharmacies = pharmacies.Take(limit).Select(p => new
            {
                id = p.Id,
                name = p.Name,
                location = $"{p.City}, {p.Address}",
                score = GenerateRandomScore(),
                totalOrders = GenerateRandomOrders() / 10,
                revenue = GenerateRandomRevenue() / 5
            });

            return Ok(topPharmacies);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting top pharmacies: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving top pharmacies" });
        }
    }

    [HttpGet("recent-orders")]
    public IActionResult GetRecentOrders([FromQuery] int limit = 10)
    {
        try
        {
            var recentOrders = new List<object>();
            var random = new Random();
            var customerNames = new[] { "Ahmed Ali", "Sara Mohamed", "Omar Hassan", "Fatma Nour", "Khaled Samir", "Mariam Ahmed", "Youssef Ibrahim", "Nour Mahmoud", "Layla Hassan", "Mohamed Ali" };
            var pharmacyNames = new[] { "City Pharmacy", "Health Plus", "MediCare Center", "Quick Meds", "Family Pharmacy", "Green Cross", "Life Care", "Wellness Center" };
            var statuses = new[] { "completed", "pending", "cancelled" };

            for (int i = 0; i < limit; i++)
            {
                recentOrders.Add(new
                {
                    id = 1000 + i,
                    customerName = customerNames[random.Next(customerNames.Length)],
                    pharmacyName = pharmacyNames[random.Next(pharmacyNames.Length)],
                    amount = (random.NextDouble() * 300 + 50).ToString("F2"),
                    status = statuses[random.Next(statuses.Length)],
                    date = DateTime.Now.AddHours(-random.Next(168)) // Last week
                });
            }

            return Ok(recentOrders);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting recent orders: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving recent orders" });
        }
    }

    [HttpGet("system-activity")]
    public IActionResult GetSystemActivity([FromQuery] int limit = 10)
    {
        try
        {
            var activities = new List<object>();
            var random = new Random();
            var activityTypes = new[] { "user", "order", "system", "error" };
            var descriptions = new[]
            {
                "New user registered",
                "Order completed",
                "Database backup completed",
                "User role updated",
                "Product added",
                "Pharmacy verified",
                "Payment processed",
                "System maintenance",
                "Error in payment gateway",
                "New pharmacy registered"
            };
            var users = new[] { "System", "Ahmed Ali", "Sara Mohamed", "Admin", "Pharmacy Manager", "User", "Omar Hassan" };

            for (int i = 0; i < limit; i++)
            {
                activities.Add(new
                {
                    id = i + 1,
                    type = activityTypes[random.Next(activityTypes.Length)],
                    description = descriptions[random.Next(descriptions.Length)],
                    user = users[random.Next(users.Length)],
                    timestamp = DateTime.Now.AddMinutes(-random.Next(1440)) // Last day
                });
            }

            return Ok(activities.OrderByDescending(a => ((dynamic)a).timestamp));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting system activity: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving system activity" });
        }
    }

    [HttpGet("user-analytics")]
    public async Task<IActionResult> GetUserAnalytics(CancellationToken cancellationToken)
    {
        try
        {
            var users = await _userService.GetAllAsync();
            
            var analytics = new
            {
                totalUsers = users.Count(),
                activeUsers = users.Count(u => u.Status == "active"),
                newUsersThisMonth = users.Count(u => u.CreatedAt.Month == DateTime.Now.Month),
                usersByRole = users.GroupBy(u => u.Role).ToDictionary(g => g.Key, g => g.Count()),
                userGrowth = new
                {
                    thisMonth = GenerateRandomGrowth(),
                    lastMonth = GenerateRandomGrowth(),
                    changePercentage = GenerateRandomChange()
                }
            };

            return Ok(analytics);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting user analytics: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving user analytics" });
        }
    }

    [HttpGet("pharmacy-performance")]
    public async Task<IActionResult> GetPharmacyPerformance(CancellationToken cancellationToken)
    {
        try
        {
            var pharmacies = await _pharmacyService.GetAllAsync();
            
            var performance = pharmacies.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                location = $"{p.City}, {p.Address}",
                rating = GenerateRandomScore(),
                totalOrders = GenerateRandomOrders(),
                revenue = GenerateRandomRevenue(),
                completionRate = GenerateRandomScore(),
                responseTime = GenerateRandomResponseTime()
            });

            return Ok(performance);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting pharmacy performance: {ex.Message}");
            return StatusCode(500, new { message = "Error retrieving pharmacy performance" });
        }
    }

    // Helper methods for generating mock data
    private static int GenerateRandomRevenue()
    {
        var random = new Random();
        return random.Next(5000, 50000);
    }

    private static int GenerateRandomOrders()
    {
        var random = new Random();
        return random.Next(50, 1000);
    }

    private static int GenerateRandomSales()
    {
        var random = new Random();
        return random.Next(10, 500);
    }

    private static int GenerateRandomScore()
    {
        var random = new Random();
        return random.Next(70, 100);
    }

    private static double GenerateRandomGrowth()
    {
        var random = new Random();
        return Math.Round(random.NextDouble() * 50 + 10, 1);
    }

    private static double GenerateRandomChange()
    {
        var random = new Random();
        return Math.Round((random.NextDouble() - 0.5) * 40, 1);
    }

    private static string GenerateRandomResponseTime()
    {
        var random = new Random();
        return $"{random.Next(1, 60)} minutes";
    }

    private static string[] GenerateDayLabels(int days)
    {
        var labels = new List<string>();
        for (int i = days - 1; i >= 0; i--)
        {
            labels.Add(DateTime.Now.AddDays(-i).ToString("MMM dd"));
        }
        return labels.ToArray();
    }

    private static string[] GenerateMonthLabels(int months)
    {
        var labels = new List<string>();
        for (int i = months - 1; i >= 0; i--)
        {
            labels.Add(DateTime.Now.AddMonths(-i).ToString("MMM yyyy"));
        }
        return labels.ToArray();
    }

    private static int[] GenerateRevenueData(int points)
    {
        var random = new Random();
        var data = new int[points];
        for (int i = 0; i < points; i++)
        {
            data[i] = random.Next(800, 2500);
        }
        return data;
    }
} 
