using System.Security.Cryptography;
using System.Text;
using HealthDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthDiary.Api.Services;

/// <summary>
/// Service for authentication and user management.
/// </summary>
public interface IAuthService
{
    // Invite Link Management
    Task<InviteLink> GenerateInviteLinkAsync(string email, Guid createdBy);
    Task<(bool success, string message)> ValidateInviteLinkAsync(string token);
    
    // Registration
    Task<(bool success, string message, User? user)> RegisterUserAsync(string inviteToken, string email, string username, string name, string password);
    
    // Login
    Task<(bool success, string message, AccessToken? accessToken, RefreshToken? refreshToken)> LoginAsync(string email, string password, string clientIp);
    
    // Token Management
    Task<(bool success, AccessToken? accessToken)> RefreshAccessTokenAsync(string refreshToken);
    
    // Password Reset
    Task<PasswordResetLink> GeneratePasswordResetLinkAsync(Guid userId);
    Task<(bool success, string message)> ResetPasswordAsync(string resetToken, string newPassword);
}

/// <summary>
/// Implementation of authentication service.
/// </summary>
public class AuthService : IAuthService
{
    private readonly HealthDiaryContext _context;
    private readonly ITokenService _tokenService;
    private readonly IRateLimitService _rateLimitService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        HealthDiaryContext context,
        ITokenService tokenService,
        IRateLimitService rateLimitService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _rateLimitService = rateLimitService;
        _logger = logger;
    }

    // ============== Invite Link Management ==============
    public async Task<InviteLink> GenerateInviteLinkAsync(string email, Guid createdBy)
    {
        var token = GenerateSecureToken();
        var expiresAt = DateTime.UtcNow.AddDays(7); // 7-day expiry

        var inviteLink = new InviteLink
        {
            Token = token,
            Email = email,
            ExpiresAt = expiresAt,
            CreatedBy = createdBy
        };

        _context.InviteLinks.Add(inviteLink);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Invite link generated for email: {email}");
        return inviteLink;
    }

    public async Task<(bool success, string message)> ValidateInviteLinkAsync(string token)
    {
        var inviteLink = await _context.InviteLinks
            .FirstOrDefaultAsync(il => il.Token == token);

        if (inviteLink == null)
            return (false, "Invalid invite link");

        if (inviteLink.IsUsed)
            return (false, "Invite link has already been used");

        if (DateTime.UtcNow > inviteLink.ExpiresAt)
            return (false, "Invite link has expired");

        return (true, "Invite link is valid");
    }

    // ============== Registration ==============
    public async Task<(bool success, string message, User? user)> RegisterUserAsync(
        string inviteToken, string email, string username, string name, string password)
    {
        // Validate invite link
        var (isValid, validationMessage) = await ValidateInviteLinkAsync(inviteToken);
        if (!isValid)
            return (false, validationMessage, null);

        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email || u.Username == username);
        if (existingUser != null)
            return (false, "Email or username already in use", null);

        // Validate password
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return (false, "Password must be at least 8 characters long", null);

        // Create user
        var passwordHash = HashPassword(password);
        var user = new User
        {
            Email = email,
            Username = username,
            Name = name,
            PasswordHash = passwordHash
        };

        _context.Users.Add(user);
        
        // Mark invite link as used
        var inviteLink = await _context.InviteLinks.FirstAsync(il => il.Token == inviteToken);
        inviteLink.IsUsed = true;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"User registered: {email}");
        return (true, "User registered successfully", user);
    }

    // ============== Login ==============
    public async Task<(bool success, string message, AccessToken? accessToken, RefreshToken? refreshToken)> LoginAsync(
        string email, string password, string clientIp)
    {
        // Rate limiting check
        if (!_rateLimitService.IsAllowed(clientIp, maxAttempts: 5, windowSeconds: 60))
            return (false, "Too many login attempts. Please try again later.", null, null);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !VerifyPassword(password, user.PasswordHash))
        {
            _rateLimitService.RecordAttempt(clientIp);
            user!.FailedLoginAttempts++;
            await _context.SaveChangesAsync();
            return (false, "Invalid email or password", null, null);
        }

        if (!user.IsActive)
            return (false, "User account is disabled", null, null);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        user.FailedLoginAttempts = 0;
        await _context.SaveChangesAsync();

        _rateLimitService.ResetAttempts(clientIp);
        _logger.LogInformation($"User logged in: {email}");

        return (true, "Login successful", accessToken, refreshToken);
    }

    // ============== Token Management ==============
    public async Task<(bool success, AccessToken? accessToken)> RefreshAccessTokenAsync(string refreshTokenString)
    {
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshTokenString);

        if (refreshToken == null || !refreshToken.IsValid)
            return (false, null);

        var user = refreshToken.User;
        var accessToken = _tokenService.GenerateAccessToken(user);

        _logger.LogInformation($"Access token refreshed for user: {user.Email}");
        return (true, accessToken);
    }

    // ============== Password Reset ==============
    public async Task<PasswordResetLink> GeneratePasswordResetLinkAsync(Guid userId)
    {
        var token = GenerateSecureToken();
        var expiresAt = DateTime.UtcNow.AddHours(1); // 1-hour expiry

        var resetLink = new PasswordResetLink
        {
            Token = token,
            UserId = userId,
            ExpiresAt = expiresAt
        };

        _context.PasswordResetLinks.Add(resetLink);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Password reset link generated for user: {userId}");
        return resetLink;
    }

    public async Task<(bool success, string message)> ResetPasswordAsync(string resetToken, string newPassword)
    {
        var resetLink = await _context.PasswordResetLinks
            .FirstOrDefaultAsync(prl => prl.Token == resetToken);

        if (resetLink == null)
            return (false, "Invalid password reset link");

        if (resetLink.IsUsed)
            return (false, "Password reset link has already been used");

        if (DateTime.UtcNow > resetLink.ExpiresAt)
            return (false, "Password reset link has expired");

        // Validate password
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 8)
            return (false, "Password must be at least 8 characters long");

        // Update password
        var user = await _context.Users.FindAsync(resetLink.UserId);
        if (user == null)
            return (false, "User not found");

        user.PasswordHash = HashPassword(newPassword);
        resetLink.IsUsed = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Password reset successful for user: {user.Email}");
        return (true, "Password reset successful");
    }

    // ============== Helper Methods ==============
    private static string GenerateSecureToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }
        return Convert.ToBase64String(randomNumber);
    }

    private static string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }
}
