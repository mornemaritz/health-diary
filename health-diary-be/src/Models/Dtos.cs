using System.Text.Json.Serialization;

namespace HealthDiary.Api.Models;

/// <summary>
/// Response DTO for daily health summary.
/// </summary>
public record DailySummary
{
  public DateOnly Date { get; set; }
  public HealthEntrySet[] HealthEntrySets { get; set; } = [];
}

public record HealthEntrySet
{
  public string RecordType { get; set; } = string.Empty;
  public Highlight[] Highlights { get; set; } = [];
  public List<HealthRecordDto> Records { get; set; } = [];
}

/// <summary>
/// Base DTO for health records.
/// </summary>
public record HealthRecordDto
{
  public Guid Id { get; set; }
  public DateOnly Date { get; set; }
  public TimeOnly Time { get; set; }
  public string RecordType { get; set; } = string.Empty;
  public string Summary { get; set; } = string.Empty;
}

public record Highlight
{
  public string Label { get; set; } = string.Empty;
  public string Status { get; set; } = "default";
}

public record MedicationAdministrationDto
{
  [JsonPropertyName("date")]
  [JsonConverter(typeof(JsonDateOnlyConverter))]
  public DateOnly Date { get; set; }

  [JsonPropertyName("time")]
  [JsonConverter(typeof(JsonTimeOnlyConverter))]
  public TimeOnly Time { get; set; }

  /// <summary>
  /// Timezone offset from UTC in minutes. Positive values are east of UTC, negative values are west.
  /// For example: UTC+2 = 120, UTC-5 = -300
  /// </summary>
  [JsonPropertyName("timezoneOffsetMinutes")]
  public int TimezoneOffsetMinutes { get; set; }

  public string Medication { get; set; } = string.Empty;
  public string Dosage { get; set; } = string.Empty;
  public string Schedule { get; set; } = string.Empty;
}

public record BottleConsumptionDto
{
  [JsonPropertyName("date")]
  [JsonConverter(typeof(JsonDateOnlyConverter))]
  public DateOnly Date { get; set; }

  [JsonPropertyName("time")]
  [JsonConverter(typeof(JsonTimeOnlyConverter))]
  public TimeOnly Time { get; set; }

  /// <summary>
  /// Timezone offset from UTC in minutes. Positive values are east of UTC, negative values are west.
  /// For example: UTC+2 = 120, UTC-5 = -300
  /// </summary>
  [JsonPropertyName("timezoneOffsetMinutes")]
  public int TimezoneOffsetMinutes { get; set; }

  public int BottleSize { get; set; }

  internal BottleConsumption ToBottleConsumption()
  {
    return new BottleConsumption
    {
      Date = Date,
      Time = Time,
      BottleSize = BottleSize
    };
  }
}

public record BowelMovementDto
{
  [JsonPropertyName("date")]
  [JsonConverter(typeof(JsonDateOnlyConverter))]
  public DateOnly Date { get; set; }

  [JsonPropertyName("time")]
  [JsonConverter(typeof(JsonTimeOnlyConverter))]
  public TimeOnly Time { get; set; }

  /// <summary>
  /// Timezone offset from UTC in minutes. Positive values are east of UTC, negative values are west.
  /// For example: UTC+2 = 120, UTC-5 = -300
  /// </summary>
  [JsonPropertyName("timezoneOffsetMinutes")]
  public int TimezoneOffsetMinutes { get; set; }
  public string Consistency { get; set; } = string.Empty;
  public string Size { get; set; } = string.Empty;
  public string Color { get; set; } = string.Empty;

  internal BowelMovement ToBowelMovement()
  {
    return new BowelMovement
    {
      Date = Date,
      Time = Time,
      Consistency = Consistency,
      Size = Size,
      Color = Color
    };
  }
}

public record SolidFoodConsumptionDto
{
  [JsonPropertyName("date")]
  [JsonConverter(typeof(JsonDateOnlyConverter))]
  public DateOnly Date { get; set; }

  [JsonPropertyName("time")]
  [JsonConverter(typeof(JsonTimeOnlyConverter))]
  public TimeOnly Time { get; set; }

  /// <summary>
  /// Timezone offset from UTC in minutes. Positive values are east of UTC, negative values are west.
  /// For example: UTC+2 = 120, UTC-5 = -300
  /// </summary>
  [JsonPropertyName("timezoneOffsetMinutes")]
  public int TimezoneOffsetMinutes { get; set; }

  public string Item { get; set; } = string.Empty;
  public string Size { get; set; } = string.Empty;

  internal SolidFoodConsumption ToSolidFoodConsumption()
  {
    return new SolidFoodConsumption
    {
      Date = Date,
      Time = Time,
      Item = Item,
      Size = Size
    };
  }
}

public record ObservationDto
{
  [JsonPropertyName("date")]
  [JsonConverter(typeof(JsonDateOnlyConverter))]
  public DateOnly Date { get; set; }

  [JsonPropertyName("time")]
  [JsonConverter(typeof(JsonTimeOnlyConverter))]
  public TimeOnly Time { get; set; }

  /// <summary>
  /// Timezone offset from UTC in minutes. Positive values are east of UTC, negative values are west.
  /// For example: UTC+2 = 120, UTC-5 = -300
  /// </summary>
  [JsonPropertyName("timezoneOffsetMinutes")]
  public int TimezoneOffsetMinutes { get; set; }

  public string Note { get; set; } = string.Empty;

  internal Observation ToObservation()
  {
    return new Observation
    {
      Date = Date,
      Time = Time,
      Note = Note
    };
  }
}

/// <summary>
/// Error response DTO.
/// </summary>
public record ErrorResponse
{
  public int StatusCode { get; set; }
  public string Message { get; set; } = string.Empty;
  public List<string>? Details { get; set; }
}

