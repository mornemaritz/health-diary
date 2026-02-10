using HealthDiary.Api.Data;
using HealthDiary.Api.Models;
using HealthDiary.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddScoped<IHealthRecordService, HealthRecordService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IRateLimitService, InMemoryRateLimitService>();

// Configure JSON serialization to handle DateOnly and TimeOnly
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<HealthDiaryContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey))
{
    throw new InvalidOperationException("JWT SecretKey is not configured. Please set it in appsettings.json");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "HealthDiary",
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"] ?? "HealthDiaryUsers",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowedHosts",
        policy =>
        {
            policy.WithOrigins(builder.Configuration["AllowedOrigins"] ?? "http://localhost:8080")
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Add global exception handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Exception caught: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }
});

// Apply migrations
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HealthDiaryContext>();
    dbContext.Database.Migrate();
}

// Only redirect to HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowedHosts");
app.UseAuthentication();
app.UseAuthorization();

// ============== Authentication API Endpoints ==============

/// <summary>
/// POST: Generate an invite link for a new user (Admin only).
/// </summary>
app.MapPost("/api/auth/admin/invite", async (GenerateInviteRequest request, IAuthService authService, HttpContext context) =>
{
    // Check if user is admin
    // var userId = context.User.FindFirst("sub")?.Value;
    // if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var adminId))
    //     return Results.Unauthorized();

    var inviteLink = await authService.GenerateInviteLinkAsync(request.Email, Guid.Parse("00000000-0000-0000-0000-000000000001"));
    return Results.Created($"/api/auth/invite/{inviteLink.Id}", new 
    {
      inviteLink.Id,
      inviteLink.Token,
      inviteLink.Email,
      inviteLink.ExpiresAt,
      Message = "Invite link generated successfully"
    });
})
.WithName("GenerateInviteLink")
.Produces(201)
.Produces(401);

/// <summary>
/// GET: Validate an invite link token.
/// </summary>
app.MapGet("/api/auth/invite/validate", async (string token, IAuthService authService) =>
{
    var (success, message) = await authService.ValidateInviteLinkAsync(token);
    return success
        ? Results.Ok(new { Message = message })
        : Results.BadRequest(new { Message = message });
})
.WithName("ValidateInviteLink")
.Produces(200)
.Produces(400);

/// <summary>
/// POST: Register a new user via invite link.
/// </summary>
app.MapPost("/api/auth/register", async (
    RegisterRequest request,
    IAuthService authService) =>
{
    var (success, message, user) = await authService.RegisterUserAsync(request.InviteToken, request.Email, request.Username, request.Name, request.Password);
    return success
        ? Results.Created($"/api/auth/users/{user!.Id}", new { Id = user.Id, Email = user.Email, Message = message })
        : Results.BadRequest(new { Message = message });
})
.WithName("RegisterUser")
.Produces(201)
.Produces(400);

/// <summary>
/// POST: Login with email and password.
/// </summary>
app.MapPost("/api/auth/login", async (LoginRequest request, IAuthService authService, HttpContext context) =>
{
    var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var (success, message, accessToken, refreshToken) = await authService.LoginAsync(request.Email, request.Password, clientIp);
    
    return success
        ? Results.Ok(new 
        { 
            AccessToken = accessToken!.Jwt,
            AccessTokenExpiresAt = accessToken.ExpiresAt,
            RefreshToken = refreshToken!.Token,
            RefreshTokenExpiresAt = refreshToken.ExpiresAt,
            Message = message
        })
        : Results.Unauthorized();
})
.WithName("Login")
.Produces(200)
.Produces(401);

/// <summary>
/// POST: Refresh access token using refresh token.
/// </summary>
app.MapPost("/api/auth/token/refresh", async (RefreshTokenRequest request, IAuthService authService) =>
{
    var (success, accessToken) = await authService.RefreshAccessTokenAsync(request.RefreshToken);
    return success
        ? Results.Ok(new 
        { 
            AccessToken = accessToken!.Jwt,
            ExpiresAt = accessToken.ExpiresAt,
            Message = "Access token refreshed"
        })
        : Results.Unauthorized();
})
.WithName("RefreshAccessToken")
.Produces(200)
.Produces(401);

/// <summary>
/// POST: Request a password reset link (Admin generates for user).
/// </summary>
app.MapPost("/api/auth/admin/password-reset", async (Guid userId, IAuthService authService, HttpContext context) =>
{
    // Check if user is admin
    if (!context.User.IsInRole("Admin"))
        return Results.Forbid();

    var resetLink = await authService.GeneratePasswordResetLinkAsync(userId);
    return Results.Ok(new 
    { 
        Token = resetLink.Token,
        ExpiresAt = resetLink.ExpiresAt,
        Message = "Password reset link generated"
    });
})
.WithName("GeneratePasswordResetLink")
.Produces(200)
.Produces(403);

/// <summary>
/// POST: Reset password using reset link.
/// </summary>
app.MapPost("/api/auth/password-reset/confirm", async (string resetToken, string newPassword, IAuthService authService) =>
{
    var (success, message) = await authService.ResetPasswordAsync(resetToken, newPassword);
    return success
        ? Results.Ok(new { Message = message })
        : Results.BadRequest(new { Message = message });
})
.WithName("ResetPassword")
.Produces(200)
.Produces(400);

// API Endpoints

/// <summary>
/// POST: Add a medication record for a date.
/// </summary>
app.MapPost("/api/health/medication", async (MedicationAdministration record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddMedicationAdministrationAsync(record);
    return success 
        ? Results.Created($"/api/health/medication/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateMedicationRecord")
.RequireAuthorization();

/// <summary>
/// POST: Add a bottle/hydration record for a date.
/// </summary>
app.MapPost("/api/health/bottle", async (BottleConsumption record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddBottleConsumptionAsync(record);
    return success 
        ? Results.Created($"/api/health/bottle/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateBottleRecord")
.RequireAuthorization();

/// <summary>
/// POST: Add a bowel movement record for a date.
/// </summary>
app.MapPost("/api/health/bowel-movement", async (BowelMovement record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddBowelMovementAsync(record);
    return success 
        ? Results.Created($"/api/health/bowel-movement/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateBowelMovementRecord")
.RequireAuthorization();

/// <summary>
/// POST: Add a solid food record for a date.
/// </summary>
app.MapPost("/api/health/solid-food", async (SolidFoodConsumption record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddSolidFoodIntakeAsync(record);
    return success 
        ? Results.Created($"/api/health/solid-food/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateSolidFoodRecord")
.RequireAuthorization();

/// <summary>
/// POST: Add a note/observation record for a date.
/// </summary>
app.MapPost("/api/health/note", async (Observation record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddObservationAsync(record);
    return success 
        ? Results.Created($"/api/health/note/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateNoteRecord")
.RequireAuthorization();

/// <summary>
/// GET: Retrieve all medication dosage groups.
/// </summary>
app.MapGet("/api/health/medications/dosage-groups", async (IHealthRecordService service) =>
{
    var dosageGroups = await service.GetAllMedicationDosageGroupsAsync();
    return Results.Ok(dosageGroups);
})
.WithName("GetAllMedicationDosageGroups")
.RequireAuthorization();

/// <summary>
/// GET: Retrieve medication dosage groups by schedule.
/// </summary>
app.MapGet("/api/health/medications/dosage-groups/schedule/{schedule}", async (string schedule, IHealthRecordService service) =>
{
    if (!Enum.TryParse<MedicationSchedule>(schedule, ignoreCase: true, out var parsedSchedule))
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Invalid schedule. Valid values are: sevenAm, threePm, sevenPm, tenPm, adHoc" 
        });

    var dosageGroups = await service.GetMedicationDosageGroupsByScheduleAsync(parsedSchedule);
    return Results.Ok(dosageGroups);
})
.WithName("GetMedicationDosageGroupsBySchedule")
.RequireAuthorization();

/// <summary>
/// GET: Retrieve summary for a given date.
/// </summary>
app.MapGet("/api/health/summary/{date}", async (string date, IHealthRecordService service) =>
{
    if (!DateOnly.TryParse(date, out var parsedDate))
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Invalid date format. Use yyyy-MM-dd." 
        });

    var summary = await service.GetDailySummaryAsync(parsedDate);
    return Results.Ok(summary);
})
.WithName("GetSummaryByDate")
.RequireAuthorization();

app.Run();
