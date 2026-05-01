namespace HealthDiary.Api.Models;

/// <summary>
/// Response DTO for daily health summary.
/// </summary>
public record DailySummary
{
    public DateOnly Date { get; set; }
    public HealthEntrySet[] HealthEntrySets = [];
    public List<HealthRecordDto> Data { get; set; } = [];
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
    public string Status { get; set; } = "success";
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
