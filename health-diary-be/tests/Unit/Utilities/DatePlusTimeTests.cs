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
}
