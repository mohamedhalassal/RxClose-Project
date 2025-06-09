using Microsoft.AspNetCore.Mvc;
using RxCloseAPI.Services;
using RxCloseAPI.DTOs;
using RxCloseAPI.Entities;
using Mapster;
using System.Security.Claims;

namespace RxCloseAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category = null, [FromQuery] string? status = null, CancellationToken cancellationToken = default)
    {
        var products = await _productService.GetAllAsync(category, status, cancellationToken);
        var response = products.Adapt<IEnumerable<ProductDto>>();
        return Ok(response);
    }

    [HttpGet("rxclose")]
    public async Task<IActionResult> GetRxCloseProducts([FromQuery] string? category = null, [FromQuery] string? status = null, CancellationToken cancellationToken = default)
    {
        var products = await _productService.GetRxCloseProductsAsync(category, status, cancellationToken);
        var response = products.Adapt<IEnumerable<ProductDto>>();
        return Ok(response);
    }

    [HttpGet("pharmacy-products")]
    public async Task<IActionResult> GetPharmacyProducts([FromQuery] string? category = null, [FromQuery] string? status = null, CancellationToken cancellationToken = default)
    {
        var products = await _productService.GetPharmacyProductsAsync(category, status, cancellationToken);
        var response = products.Adapt<IEnumerable<ProductDto>>();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetAsync(id, cancellationToken);

        if (product is null)
            return NotFound();

        var response = product.Adapt<ProductDto>();
        return Ok(response);
    }

    [HttpGet("pharmacy/{pharmacyId}")]
    public async Task<IActionResult> GetByPharmacy([FromRoute] int pharmacyId, CancellationToken cancellationToken)
    {
        var products = await _productService.GetByPharmacyAsync(pharmacyId, cancellationToken);
        var response = products.Adapt<IEnumerable<ProductDto>>();
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] CreateProductDto request, CancellationToken cancellationToken)
    {
        // Determine seller type based on user role and request
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToLower();
        var product = request.Adapt<Product>();
        
        if (userRole == "superadmin" && request.PharmacyId == null)
        {
            // Super admin adding RxClose product
            product.SellerType = "rxclose";
            product.SellerName = "RxClose";
            product.PharmacyId = null;
        }
        else if (request.PharmacyId.HasValue)
        {
            // Pharmacy admin or super admin adding pharmacy product
            product.SellerType = "pharmacy";
            product.PharmacyId = request.PharmacyId.Value;
            // SellerName will be set by the service based on pharmacy
        }
        else
        {
            return BadRequest(new { message = "Invalid product configuration. Pharmacy products must have PharmacyId." });
        }
        
        Console.WriteLine($"Creating product: SellerType={product.SellerType}, PharmacyId={product.PharmacyId}, UserRole={userRole}");
        
        var newProduct = await _productService.AddAsync(product, cancellationToken);
        var response = newProduct.Adapt<ProductDto>();
        return CreatedAtAction(nameof(Get), new { id = newProduct.Id }, response);
    }

    [HttpPost("rxclose")]
    public async Task<IActionResult> AddRxCloseProduct([FromBody] CreateProductDto request, CancellationToken cancellationToken)
    {
        // Temporarily allow without authentication for testing
        var product = request.Adapt<Product>();
        product.SellerType = "rxclose";
        product.SellerName = "RxClose";
        product.PharmacyId = null;
        
        Console.WriteLine($"Creating RxClose product: {product.Name}");
        
        var newProduct = await _productService.AddAsync(product, cancellationToken);
        var response = newProduct.Adapt<ProductDto>();
        return CreatedAtAction(nameof(Get), new { id = newProduct.Id }, response);
    }

    [HttpPost("pharmacy")]
    public async Task<IActionResult> AddPharmacyProduct([FromBody] CreateProductDto request, CancellationToken cancellationToken)
    {
        if (!request.PharmacyId.HasValue)
        {
            return BadRequest(new { message = "PharmacyId is required for pharmacy products" });
        }

        var product = request.Adapt<Product>();
        product.SellerType = "pharmacy";
        product.PharmacyId = request.PharmacyId.Value;
        // SellerName will be set by the service based on pharmacy
        
        Console.WriteLine($"Creating pharmacy product: {product.Name} for pharmacy {product.PharmacyId}");
        
        var newProduct = await _productService.AddAsync(product, cancellationToken);
        var response = newProduct.Adapt<ProductDto>();
        return CreatedAtAction(nameof(Get), new { id = newProduct.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateProductDto request, CancellationToken cancellationToken)
    {
        var isUpdated = await _productService.UpdateAsync(id, request, cancellationToken);

        if (!isUpdated)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var isDeleted = await _productService.DeleteAsync(id, cancellationToken);

        if (!isDeleted)
            return NotFound();

        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        var stats = await _productService.GetStatisticsAsync(cancellationToken);
        return Ok(stats);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _productService.GetCategoriesAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, CancellationToken cancellationToken)
    {
        var products = await _productService.SearchAsync(query, cancellationToken);
        var response = products.Adapt<IEnumerable<ProductDto>>();
        return Ok(response);
    }
} 