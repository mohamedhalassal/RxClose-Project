using Microsoft.EntityFrameworkCore;
using RxCloseAPI.Entities;
using RxCloseAPI.Persistence;
using System.Threading;
using System.Text.Json;

namespace RxCloseAPI.Services;

public class UserService : IUserService
{
    private readonly RxCloseDbContext _context;

    public UserService(RxCloseDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Users.ToListAsync(cancellationToken);
    }

    public async Task<User?> GetAsync(int id, CancellationToken cancellationToken)
    {
        return await _context.Users.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Adding new user: {user.Email}, Role: {user.Role}");
        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"User added successfully with ID: {user.Id}");
        return user;
    }

    public async Task<bool> UpdateAsync(int id, User user, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Updating user with ID: {id}");
        Console.WriteLine($"New user data: {JsonSerializer.Serialize(user)}");
        
        var existingUser = await GetAsync(id, cancellationToken);

        if (existingUser is null)
        {
            Console.WriteLine($"No user found with ID: {id}");
            return false;
        }

        Console.WriteLine($"Existing user data: {JsonSerializer.Serialize(existingUser)}");
        
        // Store the old role for comparison
        var oldRole = existingUser.Role;
        
        existingUser.Name = user.Name;
        existingUser.Email = user.Email;
        existingUser.PhoneNumber = user.PhoneNumber;
        existingUser.UserName = user.UserName;
        existingUser.Password = user.Password;
        existingUser.Location = user.Location;
        existingUser.Role = user.Role;

        Console.WriteLine($"Role changed from '{oldRole}' to '{existingUser.Role}'");
        Console.WriteLine($"Updated user data: {JsonSerializer.Serialize(existingUser)}");
        
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"User updated successfully in database");
            
            // Verify the update
            var updatedUser = await GetAsync(id, cancellationToken);
            Console.WriteLine($"Verification - User in database: {JsonSerializer.Serialize(updatedUser)}");
            
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating user: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var user = await GetAsync(id, cancellationToken);

        if (user is null)
            return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Attempting to find user with email: {email}");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user != null)
        {
            Console.WriteLine($"Found user: {user.Email}, Role: {user.Role}");
        }
        else
        {
            Console.WriteLine($"No user found with email: {email}");
        }
        return user;
    }
}
