using System;
using FluentAssertions;
using HealthDiary.Api.Utilities;
using Xunit;

namespace HealthDiary.Tests.Unit.Utilities;

public class DatePlusTimeTests
{
    [Fact]
    public void Constructor_SetsDateTimeProperty()
    {
        var input = new DateTime(2026, 5, 24, 14, 30, 0);

        var result = new DatePlusTime(input);

        result.DateTime.Should().Be(input);
    }

    [Fact]
    public void Constructor_SetsDateProperty()
    {
        var input = new DateTime(2026, 5, 24, 14, 30, 0);

        var result = new DatePlusTime(input);

        result.Date.Should().Be(new DateOnly(2026, 5, 24));
    }

    [Fact]
    public void Constructor_SetsTimeProperty()
    {
        var input = new DateTime(2026, 5, 24, 14, 30, 0);

        var result = new DatePlusTime(input);

        result.Time.Should().Be(new TimeOnly(14, 30, 0));
    }

    [Fact]
    public void Constructor_WithMidnight_SetsTimeToMidnight()
    {
        var input = new DateTime(2026, 5, 24, 0, 0, 0);

        var result = new DatePlusTime(input);

        result.Time.Should().Be(new TimeOnly(0, 0, 0));
    }

    [Fact]
    public void Constructor_WithEndOfDay_SetsTimeCorrectly()
    {
        var input = new DateTime(2026, 5, 24, 23, 59, 59);

        var result = new DatePlusTime(input);

        result.Time.Should().Be(new TimeOnly(23, 59, 59));
    }

    [Fact]
    public void Constructor_DateAndTimeCombineToDateTime()
    {
        var input = new DateTime(2026, 5, 24, 9, 15, 0);

        var result = new DatePlusTime(input);

        var reconstructed = result.Date.ToDateTime(result.Time);
        reconstructed.Should().Be(input);
    }

    [Fact]
    public void TwoInstancesWithSameDateTime_AreEqual()
    {
        var input = new DateTime(2026, 5, 24, 14, 30, 0);

        var a = new DatePlusTime(input);
        var b = new DatePlusTime(input);

        a.Should().Be(b);
    }

    [Fact]
    public void TwoInstancesWithDifferentDateTime_AreNotEqual()
    {
        var a = new DatePlusTime(new DateTime(2026, 5, 24, 14, 30, 0));
        var b = new DatePlusTime(new DateTime(2026, 5, 25, 14, 30, 0));

        a.Should().NotBe(b);
    }

    // DateOnly + TimeOnly constructor

    [Fact]
    public void Constructor_DateOnlyTimeOnly_SetsDateProperty()
    {
        var date = new DateOnly(2026, 5, 24);
        var time = new TimeOnly(14, 30, 0);

        var result = new DatePlusTime(date, time);

        result.Date.Should().Be(date);
    }

    [Fact]
    public void Constructor_DateOnlyTimeOnly_SetsTimeProperty()
    {
        var date = new DateOnly(2026, 5, 24);
        var time = new TimeOnly(14, 30, 0);

        var result = new DatePlusTime(date, time);

        result.Time.Should().Be(time);
    }

    [Fact]
    public void Constructor_DateOnlyTimeOnly_SetsDateTimeProperty()
    {
        var date = new DateOnly(2026, 5, 24);
        var time = new TimeOnly(14, 30, 0);

        var result = new DatePlusTime(date, time);

        result.DateTime.Should().Be(new DateTime(2026, 5, 24, 14, 30, 0));
    }

    [Fact]
    public void Constructor_DateOnlyTimeOnly_WithMidnight_SetsDateTimeCorrectly()
    {
        var date = new DateOnly(2026, 5, 24);
        var time = new TimeOnly(0, 0, 0);

        var result = new DatePlusTime(date, time);

        result.DateTime.Should().Be(new DateTime(2026, 5, 24, 0, 0, 0));
    }

    [Fact]
    public void Constructor_DateOnlyTimeOnly_ProducesSameResultAsDateTimeConstructor()
    {
        var dateTime = new DateTime(2026, 5, 24, 14, 30, 0);
        var date = new DateOnly(2026, 5, 24);
        var time = new TimeOnly(14, 30, 0);

        var fromDateTime = new DatePlusTime(dateTime);
        var fromDateAndTime = new DatePlusTime(date, time);

        fromDateAndTime.Should().Be(fromDateTime);
    }

    // IsAfter

    [Fact]
    public void IsAfter_WhenDateTimeIsAfterOther_ReturnsTrue()
    {
        var subject = new DatePlusTime(new DateTime(2026, 5, 24, 15, 0, 0));

        subject.IsAfter(new DateTime(2026, 5, 24, 14, 0, 0)).Should().BeTrue();
    }

    [Fact]
    public void IsAfter_WhenDateTimeIsBeforeOther_ReturnsFalse()
    {
        var subject = new DatePlusTime(new DateTime(2026, 5, 24, 13, 0, 0));

        subject.IsAfter(new DateTime(2026, 5, 24, 14, 0, 0)).Should().BeFalse();
    }

    [Fact]
    public void IsAfter_WhenDateTimeIsEqualToOther_ReturnsFalse()
    {
        var input = new DateTime(2026, 5, 24, 14, 0, 0);
        var subject = new DatePlusTime(input);

        subject.IsAfter(input).Should().BeFalse();
    }

    [Fact]
    public void IsAfter_WhenDateIsAfterOtherDate_ReturnsTrue()
    {
        var subject = new DatePlusTime(new DateTime(2026, 5, 25, 0, 0, 0));

        subject.IsAfter(new DateTime(2026, 5, 24, 23, 59, 59)).Should().BeTrue();
    }

    [Fact]
    public void IsAfter_WhenDateIsBeforeOtherDate_ReturnsFalse()
    {
        var subject = new DatePlusTime(new DateTime(2026, 5, 23, 23, 59, 59));

        subject.IsAfter(new DateTime(2026, 5, 24, 0, 0, 0)).Should().BeFalse();
    }

    // IsAfterWithTimezone tests
    
    [Fact]
    public void IsAfterWithTimezone_WhenClientTimeInUTCPlus2_AndBeforeServerTime_ReturnsFalse()
    {
        // Scenario: Client in UTC+2 submits 14:30 local time (which is 12:30 UTC)
        // Server time is 13:00 UTC
        // Expected: Should return false (12:30 UTC is before 13:00 UTC)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(14, 30, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 13, 0, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 120; // UTC+2

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeFalse();
    }

    [Fact]
    public void IsAfterWithTimezone_WhenClientTimeInUTCPlus2_AndAfterServerTime_ReturnsTrue()
    {
        // Scenario: Client in UTC+2 submits 14:30 local time (which is 12:30 UTC)
        // Server time is 12:00 UTC
        // Expected: Should return true (12:30 UTC is after 12:00 UTC)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(14, 30, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 12, 0, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 120; // UTC+2

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeTrue();
    }

    [Fact]
    public void IsAfterWithTimezone_WhenClientTimeInUTCMinus5_AndBeforeServerTime_ReturnsFalse()
    {
        // Scenario: Client in UTC-5 submits 10:00 local time (which is 15:00 UTC)
        // Server time is 16:00 UTC
        // Expected: Should return false (15:00 UTC is before 16:00 UTC)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(10, 0, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 16, 0, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = -300; // UTC-5

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeFalse();
    }

    [Fact]
    public void IsAfterWithTimezone_WhenClientTimeInUTCMinus5_AndAfterServerTime_ReturnsTrue()
    {
        // Scenario: Client in UTC-5 submits 10:00 local time (which is 15:00 UTC)
        // Server time is 14:00 UTC
        // Expected: Should return true (15:00 UTC is after 14:00 UTC)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(10, 0, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 14, 0, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = -300; // UTC-5

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeTrue();
    }

    [Fact]
    public void IsAfterWithTimezone_WhenClientTimeInUTC_AndEqualToServerTime_ReturnsFalse()
    {
        // Scenario: Client in UTC submits 14:30 (which is 14:30 UTC)
        // Server time is 14:30 UTC
        // Expected: Should return false (equal times)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(14, 30, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 14, 30, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 0; // UTC

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeFalse();
    }

    [Fact]
    public void IsAfterWithTimezone_WhenClientTimeInUTCPlus9_AndBeforeServerTime_ReturnsFalse()
    {
        // Scenario: Client in UTC+9 (Tokyo) submits 23:00 local time (which is 14:00 UTC)
        // Server time is 15:00 UTC
        // Expected: Should return false (14:00 UTC is before 15:00 UTC)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(23, 0, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 15, 0, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 540; // UTC+9

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeFalse();
    }

    [Fact]
    public void IsAfterWithTimezone_CrossingDateBoundary_WorksCorrectly()
    {
        // Scenario: Client in UTC+10 submits 02:00 on June 1st (which is 16:00 May 31st UTC)
        // Server time is 15:00 May 31st UTC
        // Expected: Should return true (16:00 May 31 UTC is after 15:00 May 31 UTC)
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 6, 1), new TimeOnly(2, 0, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 15, 0, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 600; // UTC+10

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeTrue();
    }

    [Fact]
    public void IsAfterWithTimezone_WithZeroOffset_BehavesLikeIsAfter()
    {
        // When timezone offset is 0, IsAfterWithTimezone should behave identically to IsAfter
        var datePlusTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(14, 30, 0));
        var compareTime = new DateTime(2026, 5, 31, 14, 0, 0, DateTimeKind.Utc);

        var resultWithTimezone = datePlusTime.IsAfterWithTimezone(compareTime, 0);
        var resultWithoutTimezone = datePlusTime.IsAfter(compareTime);

        resultWithTimezone.Should().Be(resultWithoutTimezone);
    }

    [Fact]
    public void IsAfterWithTimezone_RealWorldScenario_UserSubmitsCurrentTimeFromUTCPlus2()
    {
        // Real scenario from the bug report:
        // User in UTC+2 tries to submit a record for "now" (14:30 local)
        // Server is in UTC and DateTime.Now is 12:30 UTC
        // The submitted time should NOT be considered "in the future"
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(14, 30, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 12, 30, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 120; // UTC+2

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeFalse("the client's local time 14:30 UTC+2 equals 12:30 UTC, which is not after server time");
    }

    [Fact]
    public void IsAfterWithTimezone_RealWorldScenario_UserSubmitsFutureTimeFromUTCPlus2()
    {
        // User in UTC+2 tries to submit a record for 16:00 local
        // Server is in UTC and DateTime.Now is 12:30 UTC
        // The submitted time SHOULD be considered "in the future" since 16:00 UTC+2 = 14:00 UTC > 12:30 UTC
        
        var clientLocalTime = new DatePlusTime(new DateOnly(2026, 5, 31), new TimeOnly(16, 0, 0));
        var serverTimeUtc = new DateTime(2026, 5, 31, 12, 30, 0, DateTimeKind.Utc);
        var timezoneOffsetMinutes = 120; // UTC+2

        var result = clientLocalTime.IsAfterWithTimezone(serverTimeUtc, timezoneOffsetMinutes);

        result.Should().BeTrue("the client's local time 16:00 UTC+2 equals 14:00 UTC, which is after 12:30 UTC");
    }
}
