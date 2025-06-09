using Microsoft.AspNetCore.Mvc;
using RxCloseAPI.Services;
using RxCloseAPI.DTOs;
using RxCloseAPI.Entities;
using Mapster;

namespace RxCloseAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PharmacyController : ControllerBase
{
    private readonly IPharmacyService _pharmacyService;

    public PharmacyController(IPharmacyService pharmacyService)
    {
        _pharmacyService = pharmacyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var pharmacies = await _pharmacyService.GetAllAsync(cancellationToken);
        var response = pharmacies.Adapt<IEnumerable<PharmacyDto>>();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
    {
        var pharmacy = await _pharmacyService.GetAsync(id, cancellationToken);

        if (pharmacy is null)
            return NotFound();

        var response = pharmacy.Adapt<PharmacyDto>();
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] CreatePharmacyDto request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Received pharmacy creation request: {System.Text.Json.JsonSerializer.Serialize(request)}");
            
            var pharmacy = request.Adapt<Pharmacy>();
            Console.WriteLine($"Mapped to pharmacy entity: {System.Text.Json.JsonSerializer.Serialize(pharmacy)}");
            
            // Ensure UserId is set to 0 if not provided, so the service can create a new user
            if (!request.UserId.HasValue || request.UserId.Value <= 0)
            {
                pharmacy.UserId = 0;
                Console.WriteLine("UserId set to 0 for new user creation");
            }
            
            var newPharmacy = await _pharmacyService.AddAsync(pharmacy, cancellationToken);
            Console.WriteLine($"Pharmacy created successfully with ID: {newPharmacy.Id}");
            
            var response = newPharmacy.Adapt<PharmacyDto>();
            return CreatedAtAction(nameof(Get), new { id = newPharmacy.Id }, response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in Add method: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                Console.WriteLine($"Inner stack trace: {ex.InnerException.StackTrace}");
            }
            return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdatePharmacyDto updateData, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Updating pharmacy {id} with data: {System.Text.Json.JsonSerializer.Serialize(updateData)}");
            Console.WriteLine($"UpdateData is null: {updateData == null}");
            
            if (updateData == null)
            {
                Console.WriteLine("UpdateData is null - returning BadRequest");
                return BadRequest("Request body is required");
            }
            
            // Validate the model state
            if (!ModelState.IsValid)
            {
                Console.WriteLine("Model validation failed:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"Field: {error.Key}, Errors: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }
            
            var isUpdated = await _pharmacyService.UpdateAsync(id, updateData, cancellationToken);

            if (!isUpdated)
            {
                Console.WriteLine($"Pharmacy {id} not found");
                return NotFound();
            }

            // Get the updated pharmacy to return it
            var updatedPharmacy = await _pharmacyService.GetAsync(id, cancellationToken);
            if (updatedPharmacy == null)
            {
                Console.WriteLine($"Could not retrieve updated pharmacy {id}");
                return NotFound();
            }

            Console.WriteLine($"Pharmacy {id} updated successfully");
            var response = updatedPharmacy.Adapt<PharmacyDto>();
            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating pharmacy {id}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var isDeleted = await _pharmacyService.DeleteAsync(id, cancellationToken);

        if (!isDeleted)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] StatusUpdateRequest request, CancellationToken cancellationToken)
    {
        var isUpdated = await _pharmacyService.UpdateStatusAsync(id, request.Status, cancellationToken);

        if (!isUpdated)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/verify")]
    public async Task<IActionResult> VerifyPharmacy([FromRoute] int id, CancellationToken cancellationToken)
    {
        var isUpdated = await _pharmacyService.VerifyPharmacyAsync(id, cancellationToken);

        if (!isUpdated)
            return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/admin")]
    public async Task<IActionResult> AdminUpdate([FromRoute] int id, [FromBody] AdminUpdatePharmacyDto adminUpdateData, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"Admin updating pharmacy {id} with data: {System.Text.Json.JsonSerializer.Serialize(adminUpdateData)}");
            
            // Validate the model state
            if (!ModelState.IsValid)
            {
                Console.WriteLine("Model validation failed:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"Field: {error.Key}, Errors: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }
            
            var isUpdated = await _pharmacyService.AdminUpdateAsync(id, adminUpdateData, cancellationToken);

            if (!isUpdated)
            {
                Console.WriteLine($"Pharmacy {id} not found");
                return NotFound();
            }

            // Get the updated pharmacy to return it
            var updatedPharmacy = await _pharmacyService.GetAsync(id, cancellationToken);
            if (updatedPharmacy == null)
            {
                Console.WriteLine($"Could not retrieve updated pharmacy {id}");
                return NotFound();
            }

            Console.WriteLine($"Pharmacy {id} updated successfully by admin");
            var response = updatedPharmacy.Adapt<PharmacyDto>();
            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error admin updating pharmacy {id}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        var stats = await _pharmacyService.GetStatisticsAsync(cancellationToken);
        return Ok(stats);
    }
}

public class StatusUpdateRequest
{
    public string Status { get; set; } = string.Empty;
} 