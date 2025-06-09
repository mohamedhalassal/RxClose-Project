namespace RxCloseAPI.Conntracts.Responses;

public record UserResponse(
        int Id,
        string PhoneNumber,
        string Name,
        string UserName,
        string Email,
        string Location,
        string Role,
        DateTime CreatedAt,
        DateTime? LastLogin,
        string Status,
        string? Avatar
    );