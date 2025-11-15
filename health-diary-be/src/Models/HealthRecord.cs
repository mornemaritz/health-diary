namespace HealthDiary.Api.Models;

/// <summary>
/// Base entity for all health record types, grouped by date.
/// </summary>
public abstract record HealthRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
}

/// <summary>
/// Medication administration record.
/// </summary>
public record MedicationRecord : HealthRecord
{
    public required string Medication { get; set; }
    public required string Dosage { get; set; }
    public required MedicationSchedule Schedule { get; set; }
}

/// <summary>
/// Schedule options for medication administration.
/// </summary>
public enum MedicationSchedule
{
    SevenAm,
    ThreePm,
    SevenPm,
    TenPm,
    AdHoc
}

/// <summary>
/// Hydration/bottle record.
/// </summary>
public record BottleRecord : HealthRecord
{
    public int BottleSize { get; set; }
}

/// <summary>
/// Bowel movement record with details.
/// </summary>
public record BowelMovementRecord : HealthRecord
{
    public required string Size { get; set; }
    public required string Consistency { get; set; }
    public required string Color { get; set; }
}

/// <summary>
/// Solid food intake record.
/// </summary>
public record SolidFoodRecord : HealthRecord
{
    public required string Item { get; set; }
    public required string Size { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// General note/observation record.
/// </summary>
public record NoteRecord : HealthRecord
{
    public required string Note { get; set; }
}
