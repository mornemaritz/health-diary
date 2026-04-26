public record DatePlusTime
{
  public DateOnly Date { get; init; }
  public TimeOnly Time { get; init; }
  public DateTime DateTime { get; init; }

  public DatePlusTime(DateTime parsedDateTime)
  {
    DateTime = parsedDateTime;
    Date = DateOnly.FromDateTime(parsedDateTime);
    Time = TimeOnly.FromDateTime(parsedDateTime);
  }
}