using System;
using FluentAssertions;
using HealthDiary.Api.Models;
using HealthDiary.Api.Utilities;
using Xunit;

namespace HealthDiary.Tests.Integration;

/// <summary>
/// Integration tests for timezone offset functionality in health record endpoints.
/// These tests verify that the API correctly handles timezone offsets when validating
/// whether a submitted record is in the future.
/// </summary>
public class TimezoneIntegrationTests
{
    [Fact]
    public void MedicationEndpoint_WithCurrentTimeInUTCPlus2_ShouldAcceptRecord()
    {
        // Arrange: Simulate a client in UTC+2 submitting current time
        // Client local time: 14:30 (UTC+2) = 12:30 UTC
        // Server time is 12:30 UTC - this should be accepted
        var serverTimeUtc = new DateTime(2026, 5, 31, 12, 30, 0, DateTimeKind.Utc);
        var clientLocalTime = serverTimeUtc.AddHours(2); // 14:30 in UTC+2
        
        var record = new MedicationAdministrationDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = 120, // UTC+2
            Medication = "Test Med",
            Dosage = "10mg",
            Schedule = "AdHoc"
        };

        // Act: Validate using the same logic as the endpoints
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Should NOT be considered in the future
        isInFuture.Should().BeFalse("client time 14:30 UTC+2 equals 12:30 UTC, which is not after server time");
    }

    [Fact]
    public void MedicationEndpoint_WithFutureTimeInUTCPlus2_ShouldRejectRecord()
    {
        // Arrange: Simulate a client in UTC+2 submitting future time
        // Server time: 12:30 UTC
        // Client submits: 16:00 UTC+2 = 14:00 UTC (1.5 hours in the future)
        var serverTimeUtc = new DateTime(2026, 5, 31, 12, 30, 0, DateTimeKind.Utc);
        var futureTimeUtc = serverTimeUtc.AddHours(1.5); // 14:00 UTC
        var clientLocalTime = futureTimeUtc.AddHours(2); // 16:00 UTC+2
        
        var record = new MedicationAdministrationDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = 120, // UTC+2
            Medication = "Test Med",
            Dosage = "10mg",
            Schedule = "AdHoc"
        };

        // Act: Validate using the same logic as the endpoints
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Should be considered in the future and rejected
        isInFuture.Should().BeTrue("client time 16:00 UTC+2 equals 14:00 UTC, which is 1.5 hours after server time");
    }

    [Fact]
    public void BottleEndpoint_WithCurrentTimeInUTCMinus5_ShouldAcceptRecord()
    {
        // Arrange: Simulate a client in UTC-5 (US Eastern) submitting current time
        // Server time: 15:00 UTC
        // Client submits: 10:00 UTC-5 = 15:00 UTC (same time)
        var serverTimeUtc = new DateTime(2026, 5, 31, 15, 0, 0, DateTimeKind.Utc);
        var clientLocalTime = serverTimeUtc.AddHours(-5); // 10:00 in UTC-5
        
        var record = new BottleConsumptionDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = -300, // UTC-5
            BottleSize = 120
        };

        // Act: Validate using the same logic as the endpoints
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Should NOT be considered in the future
        isInFuture.Should().BeFalse("client time 10:00 UTC-5 equals 15:00 UTC, which equals server time");
    }

    [Fact]
    public void BowelMovementEndpoint_WithEdgeCaseTimezone_ShouldHandleCorrectly()
    {
        // Arrange: Test with UTC+13 (Tonga) - one of the most extreme positive offsets
        // Server time: 10:00 UTC
        // Client submits: 23:00 UTC+13 = 10:00 UTC (same time)
        var serverTimeUtc = new DateTime(2026, 5, 31, 10, 0, 0, DateTimeKind.Utc);
        var clientLocalTime = serverTimeUtc.AddHours(13); // 23:00 in UTC+13
        
        var record = new BowelMovementDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = 780, // UTC+13
            Size = "Normal",
            Consistency = "Normal",
            Color = "Brown"
        };

        // Act: Validate using the same logic as the endpoints
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Should handle extreme timezone offset correctly
        isInFuture.Should().BeFalse("client time 23:00 UTC+13 equals 10:00 UTC, which equals server time");
    }

    [Theory]
    [InlineData(0)]      // UTC
    [InlineData(60)]     // UTC+1 (CET)
    [InlineData(120)]    // UTC+2 (EET)
    [InlineData(-300)]   // UTC-5 (EST)
    [InlineData(-420)]   // UTC-7 (PST)
    [InlineData(330)]    // UTC+5:30 (IST)
    [InlineData(345)]    // UTC+5:45 (Nepal)
    [InlineData(540)]    // UTC+9 (JST)
    [InlineData(-600)]   // UTC-10 (HST)
    public void VariousTimezones_WithCurrentTime_ShouldAllBeAccepted(int timezoneOffsetMinutes)
    {
        // Arrange: Test multiple common timezones
        // All clients submit their current local time, which corresponds to 14:00 UTC
        var serverTimeUtc = new DateTime(2026, 5, 31, 14, 0, 0, DateTimeKind.Utc);
        var clientLocalTime = serverTimeUtc.AddMinutes(timezoneOffsetMinutes);
        
        var record = new SolidFoodConsumptionDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = timezoneOffsetMinutes,
            Item = "Test Food",
            Size = "Medium"
        };

        // Act: Validate using the same logic as the endpoints
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: All should be accepted since they represent "now" in different timezones
        isInFuture.Should().BeFalse($"client time with offset {timezoneOffsetMinutes} should equal 14:00 UTC");
    }

    [Fact]
    public void ObservationEndpoint_CrossingDateBoundary_ShouldHandleCorrectly()
    {
        // Arrange: Client in UTC+11 submitting observation at 02:00 local time (next day)
        // which is actually 15:00 previous day in UTC
        // Server time: May 31 15:00 UTC
        // Client submits: June 1 02:00 UTC+11 = May 31 15:00 UTC
        var serverTimeUtc = new DateTime(2026, 5, 31, 15, 0, 0, DateTimeKind.Utc);
        var clientLocalTime = serverTimeUtc.AddHours(11); // June 1st, 02:00 in UTC+11
        
        var record = new ObservationDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime), // June 1st
            Time = TimeOnly.FromDateTime(clientLocalTime), // 02:00
            TimezoneOffsetMinutes = 660, // UTC+11
            Note = "Test observation"
        };

        // Act: Validate using the same logic as the endpoints
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Should correctly handle date boundary crossing
        isInFuture.Should().BeFalse("client time June 1 02:00 UTC+11 equals May 31 15:00 UTC");
        
        // Verify the date boundary crossing
        record.Date.Should().Be(new DateOnly(2026, 6, 1), "client sees June 1st");
        var utcDateTime = datePlusTime.DateTime.AddMinutes(-record.TimezoneOffsetMinutes);
        DateOnly.FromDateTime(utcDateTime).Should().Be(new DateOnly(2026, 5, 31), "but in UTC it's May 31st");
    }

    [Fact]
    public void DSTTransition_ShouldBeHandledByClient()
    {
        // This is a documentation test showing how DST is handled
        // The timezone offset is calculated by the client
        // During DST transitions, the client is responsible for sending
        // the correct offset for their current local time
        
        // Summer example (with DST):
        var summerServerTime = new DateTime(2026, 7, 15, 12, 0, 0, DateTimeKind.Utc);
        var summerClientTime = summerServerTime.AddHours(2); // UTC+2 with DST
        var summerRecord = new MedicationAdministrationDto
        {
            Date = DateOnly.FromDateTime(summerClientTime),
            Time = TimeOnly.FromDateTime(summerClientTime),
            TimezoneOffsetMinutes = 120, // UTC+2 (CET + DST)
            Medication = "Test",
            Dosage = "10mg",
            Schedule = "AdHoc"
        };
        
        var summerValidation = new DatePlusTime(summerRecord.Date, summerRecord.Time)
            .IsAfterWithTimezone(summerServerTime, summerRecord.TimezoneOffsetMinutes);
        summerValidation.Should().BeFalse();
        
        // Winter example (without DST):
        var winterServerTime = new DateTime(2026, 1, 15, 12, 0, 0, DateTimeKind.Utc);
        var winterClientTime = winterServerTime.AddHours(1); // UTC+1 without DST
        var winterRecord = new MedicationAdministrationDto
        {
            Date = DateOnly.FromDateTime(winterClientTime),
            Time = TimeOnly.FromDateTime(winterClientTime),
            TimezoneOffsetMinutes = 60, // UTC+1 (CET without DST)
            Medication = "Test",
            Dosage = "10mg",
            Schedule = "AdHoc"
        };
        
        var winterValidation = new DatePlusTime(winterRecord.Date, winterRecord.Time)
            .IsAfterWithTimezone(winterServerTime, winterRecord.TimezoneOffsetMinutes);
        winterValidation.Should().BeFalse();
        
        // The server doesn't need to know about DST rules, it just uses the offset provided by the client
    }
    
    [Fact]
    public void PastRecord_WithAnyTimezone_ShouldAlwaysBeAccepted()
    {
        // Arrange: Client submits a record from 2 hours ago in their timezone
        var serverTimeUtc = new DateTime(2026, 5, 31, 14, 0, 0, DateTimeKind.Utc);
        var twoHoursAgoUtc = serverTimeUtc.AddHours(-2); // 12:00 UTC
        var clientLocalTime = twoHoursAgoUtc.AddHours(2); // 14:00 in UTC+2 (but from 2 hours ago)
        
        var record = new BottleConsumptionDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = 120, // UTC+2
            BottleSize = 180
        };

        // Act
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Past records should always be accepted
        isInFuture.Should().BeFalse("records from the past should always be accepted");
    }
    
    [Fact]
    public void FutureRecord_ByOneSecond_ShouldBeRejected()
    {
        // Arrange: Client submits a record just 1 second in the future
        var serverTimeUtc = new DateTime(2026, 5, 31, 14, 30, 0, DateTimeKind.Utc);
        var oneSecondFutureUtc = serverTimeUtc.AddSeconds(1); // 14:30:01 UTC
        var clientLocalTime = oneSecondFutureUtc.AddHours(2); // 16:30:01 in UTC+2
        
        var record = new BowelMovementDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = 120, // UTC+2
            Size = "Medium",
            Consistency = "Normal",
            Color = "Brown"
        };

        // Act
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Even 1 second in the future should be rejected
        isInFuture.Should().BeTrue("future records should be rejected, even if just by one second");
    }
    
    [Fact]
    public void NegativeTimezone_WithFutureTime_ShouldBeRejected()
    {
        // Arrange: Client in UTC-8 (Pacific Time) submits future time
        // Server time: 10:00 UTC
        // Client submits: 04:00 UTC-8 = 12:00 UTC (2 hours in the future)
        var serverTimeUtc = new DateTime(2026, 5, 31, 10, 0, 0, DateTimeKind.Utc);
        var futureTimeUtc = serverTimeUtc.AddHours(2); // 12:00 UTC
        var clientLocalTime = futureTimeUtc.AddHours(-8); // 04:00 in UTC-8
        
        var record = new SolidFoodConsumptionDto
        {
            Date = DateOnly.FromDateTime(clientLocalTime),
            Time = TimeOnly.FromDateTime(clientLocalTime),
            TimezoneOffsetMinutes = -480, // UTC-8
            Item = "Breakfast",
            Size = "Large"
        };

        // Act
        var datePlusTime = new DatePlusTime(record.Date, record.Time);
        var isInFuture = datePlusTime.IsAfterWithTimezone(serverTimeUtc, record.TimezoneOffsetMinutes);

        // Assert: Future time should be rejected for negative timezones too
        isInFuture.Should().BeTrue("client time 04:00 UTC-8 equals 12:00 UTC, which is 2 hours after server time");
    }
}
