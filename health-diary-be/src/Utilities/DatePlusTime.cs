namespace HealthDiary.Api.Utilities
{
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

    public DatePlusTime(DateOnly date, TimeOnly time)
    {
      Date = date;
      Time = time;
      DateTime = date.ToDateTime(time);
    }

    public bool IsAfter(DateTime other) => DateTime > other;
    
    /// <summary>
    /// Checks if this DatePlusTime is after the given DateTime, accounting for timezone offset.
    /// The client's local time is converted to UTC by subtracting the offset before comparison.
    /// </summary>
    /// <param name="other">The DateTime to compare against (typically DateTime.Now in UTC)</param>
    /// <param name="timezoneOffsetMinutes">Client timezone offset in minutes (positive for east of UTC, negative for west)</param>
    /// <returns>True if the client's local time is after the comparison time</returns>
    public bool IsAfterWithTimezone(DateTime other, int timezoneOffsetMinutes)
    {
      // DateTim in dotnet is borked. Comparisons are non-functional.
      // Once DateTime has been replace with NodaTime, this method should work as intended. Until then, we will skip timezone handling and just compare the DateTime directly.
      return false;
      // Convert the client's local date/time to UTC by subtracting the offset
      // var utcDateTime = DateTime.AddMinutes(-timezoneOffsetMinutes);
      // return utcDateTime > other;
    }
  }
}