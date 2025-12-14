using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using HealthDiary.Api.Models;
using HealthDiary.Api.Data;

namespace HealthDiary.Api.Services;

/// <summary>
/// Service for managing JWT tokens.
/// </summary>
public interface ITokenService
{
    AccessToken GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(Guid userId);
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}

/// <summary>
/// Implementation of JWT token service.
/// </summary>
public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly HealthDiaryContext _context;

    public JwtTokenService(IConfiguration configuration, HealthDiaryContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public AccessToken GenerateAccessToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:SecretKey"] ?? "your-secret-key-change-in-production"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(
            int.Parse(_configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "HealthDiary",
            audience: _configuration["Jwt:Audience"] ?? "HealthDiaryUsers",
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        var accessTokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return new AccessToken { Jwt = accessTokenString, UserId = user.Id, ExpiresAt = expires };
    }

    public RefreshToken GenerateRefreshToken(Guid userId)
    {
        var randomNumber = new byte[64];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }

        var refreshTokenString = Convert.ToBase64String(randomNumber);
        var expiresAt = DateTime.UtcNow.AddDays(
            int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7"));

        return new RefreshToken
        {
            Token = refreshTokenString,
            UserId = userId,
            ExpiresAt = expiresAt
        };
    }

    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:SecretKey"] ?? "your-secret-key-change-in-production")),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

        if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
}
