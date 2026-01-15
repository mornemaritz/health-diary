namespace HealthDiary.Api.Models;

/// <summary>
/// User entity for authentication and registration.
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string Name { get; set; }
    public required string PasswordHash { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAdmin { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int FailedLoginAttempts { get; set; } = 0;

    // Navigation properties
    public ICollection<InviteLink> CreatedInviteLinks { get; set; } = new List<InviteLink>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<PasswordResetLink> PasswordResetLinks { get; set; } = new List<PasswordResetLink>();
}

/// <summary>
/// Invite link for registration.
/// </summary>
public class InviteLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Token { get; set; }
    public required string Email { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Creator { get; set; } = null!;
}

/// <summary>
/// Password reset link.
/// </summary>
public class PasswordResetLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Token { get; set; }
    public Guid UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}

/// <summary>
/// Refresh token for token renewal.
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Token { get; set; }
    public Guid UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;

    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    public bool IsValid => !IsRevoked && !IsExpired;
}

/// <summary>
/// Access token claim data.
/// </summary>
public class AccessToken
{
    public required string Jwt { get; set; }
    public Guid UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// Request DTO for user registration.
/// </summary>
public record RegisterRequest
{
    public required string InviteToken { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string Name { get; set; }
    public required string Password { get; set; }
}

/// <summary>
/// Request DTO for user login.
/// </summary>
public record LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

/// <summary>
/// Request DTO for token refresh.
/// </summary>
public record RefreshTokenRequest
{
    public required string RefreshToken { get; set; }
}

/// <summary>
/// Request DTO for invite link generation.
/// </summary>
public record GenerateInviteRequest
{
    public required string Email { get; set; }
}
