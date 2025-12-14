using System.Text.Json.Serialization;

namespace HealthDiary.Api.Models;

/// <summary>
/// Base entity for all health record types, grouped by date.
/// </summary>
public abstract record HealthRecord
{
  public Guid Id { get; set; } = Guid.NewGuid();
  
  [JsonPropertyName("date")]
  [JsonConverter(typeof(JsonDateOnlyConverter))]
  public DateOnly Date { get; set; }
  
  [JsonPropertyName("time")]
  [JsonConverter(typeof(JsonTimeOnlyConverter))]
  public TimeOnly Time { get; set; }
}

/// <summary>
/// JSON converter for DateOnly
/// </summary>
public class JsonDateOnlyConverter : System.Text.Json.Serialization.JsonConverter<DateOnly>
{
  public override DateOnly Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
  {
    return DateOnly.ParseExact(reader.GetString()!, "yyyy-MM-dd");
  }

  public override void Write(System.Text.Json.Utf8JsonWriter writer, DateOnly value, System.Text.Json.JsonSerializerOptions options)
  {
    writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
  }
}

/// <summary>
/// JSON converter for TimeOnly
/// </summary>
public class JsonTimeOnlyConverter : System.Text.Json.Serialization.JsonConverter<TimeOnly>
{
  public override TimeOnly Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
  {
    return TimeOnly.ParseExact(reader.GetString()!, "HH:mm");
  }

  public override void Write(System.Text.Json.Utf8JsonWriter writer, TimeOnly value, System.Text.Json.JsonSerializerOptions options)
  {
    writer.WriteStringValue(value.ToString("HH:mm"));
  }
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
  [JsonPropertyName("note")]
  public required string Note { get; set; }
}
