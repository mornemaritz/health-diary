using HealthDiary.Api.Data;
using HealthDiary.Api.Models;
using HealthDiary.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddScoped<IHealthRecordService, HealthRecordService>();

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<HealthDiaryContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Apply migrations
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HealthDiaryContext>();
    dbContext.Database.Migrate();
}

app.UseHttpsRedirection();

// API Endpoints

/// <summary>
/// POST: Add a medication record for a date.
/// </summary>
app.MapPost("/api/health/medication", async (MedicationRecord record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddMedicationRecordAsync(record);
    return success 
        ? Results.Created($"/api/health/medication/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateMedicationRecord");

/// <summary>
/// POST: Add a bottle/hydration record for a date.
/// </summary>
app.MapPost("/api/health/bottle", async (BottleRecord record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddBottleRecordAsync(record);
    return success 
        ? Results.Created($"/api/health/bottle/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateBottleRecord");

/// <summary>
/// POST: Add a bowel movement record for a date.
/// </summary>
app.MapPost("/api/health/bowel-movement", async (BowelMovementRecord record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddBowelMovementRecordAsync(record);
    return success 
        ? Results.Created($"/api/health/bowel-movement/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateBowelMovementRecord");

/// <summary>
/// POST: Add a solid food record for a date.
/// </summary>
app.MapPost("/api/health/solid-food", async (SolidFoodRecord record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddSolidFoodRecordAsync(record);
    return success 
        ? Results.Created($"/api/health/solid-food/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateSolidFoodRecord");

/// <summary>
/// POST: Add a note/observation record for a date.
/// </summary>
app.MapPost("/api/health/note", async (NoteRecord record, IHealthRecordService service) =>
{
    if (record.Date == default || record.Time == default)
        return Results.BadRequest(new ErrorResponse 
        { 
            StatusCode = 400, 
            Message = "Date and Time are required." 
        });

    var (success, message, recordId) = await service.AddNoteRecordAsync(record);
    return success 
        ? Results.Created($"/api/health/note/{recordId}", new { Id = recordId, Message = message })
        : Results.Conflict(new ErrorResponse { StatusCode = 409, Message = message });
})
.WithName("CreateNoteRecord");

/// <summary>
/// GET: Retrieve all records for a given date.
/// </summary>
app.MapGet("/api/health/records/{date}", async (string date, IHealthRecordService service) =>
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
.WithName("GetRecordsByDate");

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
.WithName("GetSummaryByDate");

app.Run();
