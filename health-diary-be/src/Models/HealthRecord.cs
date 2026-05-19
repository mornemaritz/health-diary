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
public class JsonDateOnlyConverter : JsonConverter<DateOnly>
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
public class JsonTimeOnlyConverter : JsonConverter<TimeOnly>
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
  public required MedicationDosage MedicationDosage { get; set; }
  public required MedicationSchedule Schedule { get; set; }

  public static HealthEntrySet EntrySet(List<MedicationAdministration> medications, DatePlusTime datePlusTime)
  {
    // If date is in the future, return empty sets
    if (datePlusTime.DateTime > DateTime.Now)
    {
      return new HealthEntrySet
      {
        RecordType = nameof(MedicationAdministration),
        Highlights = [],
        Records = []
      };
    }

    // Transform medications to HealthRecordDto
    var records = medications.Select(m => new HealthRecordDto 
    { 
      Id = m.Id, 
      Date = m.Date, 
      Time = m.Time, 
      RecordType = "Medication", 
      Summary = $"{m.MedicationDosage.Medication} - {m.MedicationDosage.Dosage} ({GetShortSchedule(m.Schedule)})" 
    }).ToList();

    // Create highlights for each non-AdHoc schedule
    var schedules = new[] 
    { 
      MedicationSchedule.SevenAm, 
      MedicationSchedule.ThreePm, 
      MedicationSchedule.SevenPm, 
      MedicationSchedule.TenPm 
    };

    var highlights = new List<Highlight>();
    var isCurrent = datePlusTime.DateTime.Date == DateTime.Now.Date;
    var currentTime = TimeOnly.FromDateTime(DateTime.Now);

    foreach (var schedule in schedules)
    {
      var scheduleTime = GetScheduleTime(schedule);
      var scheduleMeds = medications.Where(m => m.Schedule == schedule).ToList();
      var status = DetermineStatus(isCurrent, currentTime, scheduleTime, scheduleMeds);

      highlights.Add(new Highlight
      {
        Label = GetShortSchedule(schedule),
        Status = status
      });
    }

    return new HealthEntrySet
    {
      RecordType = nameof(MedicationAdministration),
      Highlights = [.. highlights],
      Records = records
    };
  }

  private static string GetShortSchedule(MedicationSchedule schedule)
  {
    return schedule switch
    {
      MedicationSchedule.SevenAm => "7am",
      MedicationSchedule.ThreePm => "3pm",
      MedicationSchedule.SevenPm => "7pm",
      MedicationSchedule.TenPm => "10pm",
      _ => "AdHoc"
    };
  }

  private static TimeOnly GetScheduleTime(MedicationSchedule schedule)
  {
    return schedule switch
    {
      MedicationSchedule.SevenAm => new TimeOnly(7, 0),
      MedicationSchedule.ThreePm => new TimeOnly(15, 0),
      MedicationSchedule.SevenPm => new TimeOnly(19, 0),
      MedicationSchedule.TenPm => new TimeOnly(22, 0),
      _ => throw new ArgumentException($"Invalid schedule: {schedule}")
    };
  }

  private static string DetermineStatus(bool isCurrent, TimeOnly currentTime, TimeOnly scheduleTime, List<MedicationAdministration> scheduleMeds)
  {
    if (isCurrent)
    {
      // Current day logic
      if (currentTime < scheduleTime)
      {
        return "neutral";
      }
      
      return scheduleMeds.Any() ? "success" : "warning";
    }
    else
    {
      // Historical day logic
      if (!scheduleMeds.Any())
      {
        return "error";
      }

      // Check if any medication is within 1 hour of schedule time
      var hasWithinHour = scheduleMeds.Any(m => 
      {
        var diff = m.Time > scheduleTime 
          ? m.Time - scheduleTime 
          : scheduleTime - m.Time;
        return diff.TotalHours <= 1.0;
      });

      return hasWithinHour ? "success" : "warning";
    }
  }
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
  public required MedicationDosage MedicationDosage { get; init; }
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
  [JsonPropertyName("quantity")]
  public int BottleSize { get; set; }
  public static HealthEntrySet EntrySet(List<BottleConsumption> bottles, DatePlusTime datePlusTime)
  {
    // Transform bottles to HealthRecordDto
    var records = bottles.Select(b => new HealthRecordDto 
    { 
      Id = b.Id, 
      Date = b.Date, 
      Time = b.Time, 
      RecordType = "Bottle", 
      Summary = $"{b.BottleSize}ml" 
    }).ToList();

    return new HealthEntrySet
    {
      RecordType = nameof(BottleConsumption),
      Highlights = [],
      Records = records
    };
    
  }
}

/// <summary>
/// Bowel movement record with details.
/// </summary>
public record BowelMovement : HealthRecord
{
  public required string Size { get; set; }
  public required string Consistency { get; set; }
  public required string Color { get; set; }
  public static HealthEntrySet EntrySet(List<BowelMovement> bowelMovements, DatePlusTime datePlusTime)
  {
    // Transform bowel movements to HealthRecordDto
    var records = bowelMovements.Select(b => new HealthRecordDto 
    { 
      Id = b.Id, 
      Date = b.Date, 
      Time = b.Time, 
      RecordType = "BowelMovement", 
      Summary = $"{b.Size} {b.Color} {b.Consistency}" 
    }).ToList();

    return new HealthEntrySet
    {
      RecordType = nameof(BowelMovement),
      Highlights = [],
      Records = records
    };
    
  }
}

/// <summary>
/// Solid food intake record.
/// </summary>
public record SolidFoodConsumption : HealthRecord
{
  public required string Item { get; set; }
  public required string Size { get; set; }
  public string? Notes { get; set; }
  public static HealthEntrySet EntrySet(List<SolidFoodConsumption> solidFoods, DatePlusTime datePlusTime)
  {
    // Transform solid foods to HealthRecordDto
    var records = solidFoods.Select(s => new HealthRecordDto 
    { 
      Id = s.Id, 
      Date = s.Date, 
      Time = s.Time, 
      RecordType = "SolidFood", 
      Summary = $"{s.Size} - {s.Item} {s.Notes}" 
    }).ToList();

    return new HealthEntrySet
    {
      RecordType = nameof(SolidFoodConsumption),
      Highlights = [],
      Records = records
    };
    
  }
}

/// <summary>
/// General note/observation record.
/// </summary>
public record Observation : HealthRecord
{
  [JsonPropertyName("note")]
  public required string Note { get; set; }
  public static HealthEntrySet EntrySet(List<Observation> observations, DatePlusTime datePlusTime)
  {
    // Transform observations to HealthRecordDto
    var records = observations.Select(o => new HealthRecordDto 
    { 
      Id = o.Id, 
      Date = o.Date, 
      Time = o.Time, 
      RecordType = "Observation", 
      Summary = o.Note
    }).ToList();

    return new HealthEntrySet
    {
      RecordType = nameof(Observation),
      Highlights = [],
      Records = records
    };
  }
}
