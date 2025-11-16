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
public record MedicationAdministration : HealthRecord
{
  public required string Medication { get; set; }
  public required string Dosage { get; set; }
  public required MedicationSchedule Schedule { get; set; }
}

/// <summary>
/// Medication Dosage.
/// </summary>
public record MedicationDosage
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public required string Medication { get; set; }
  public required string Dosage { get; set; }
}

/// <summary>
/// Medication Dosage Group.
/// </summary>
public record MedicationDosageGroup
{
  public Guid Id { get; set; } = Guid.NewGuid();
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
/// Hydration/bottle consumption record.
/// </summary>
public record BottleConsumption : HealthRecord
{
  public int BottleSize { get; set; }
}

/// <summary>
/// Bowel movement record with details.
/// </summary>
public record BowelMovement : HealthRecord
{
  public required string Size { get; set; }
  public required string Consistency { get; set; }
  public required string Color { get; set; }
}

/// <summary>
/// Solid food intake record.
/// </summary>
public record SolidFoodConsumption : HealthRecord
{
  public required string Item { get; set; }
  public required string Size { get; set; }
  public string? Notes { get; set; }
}

/// <summary>
/// General note/observation record.
/// </summary>
public record Observation : HealthRecord
{
  public required string Note { get; set; }
}
