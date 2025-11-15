using System;
using HealthDiary.Api.Models;
using HealthDiary.Api.Data;
using HealthDiary.Api.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HealthDiary.Tests.Unit;

public class HealthRecordServiceTests : IAsyncLifetime
{
    private HealthDiaryContext _context = null!;

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<HealthDiaryContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new HealthDiaryContext(options);
        await _context.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await _context.Database.EnsureDeletedAsync();
        _context.Dispose();
    }

    [Fact]
    public async Task AddMedicationRecord_WithValidData_ShouldSucceed()
    {
        // Arrange
        var service = new HealthRecordService(_context);
        var record = new MedicationRecord
        {
            Medication = "Aspirin",
            Dosage = "100mg",
            Schedule = MedicationSchedule.SevenAm,
            Date = DateOnly.FromDateTime(DateTime.Now),
            Time = new TimeOnly(7, 0)
        };

        // Act
        var (success, message, recordId) = await service.AddMedicationRecordAsync(record);

        // Assert
        success.Should().BeTrue();
        recordId.Should().NotBeEmpty();
        message.Should().Contain("successfully");
    }

    [Fact]
    public async Task AddMedicationRecord_WithDuplicate_ShouldReturnConflict()
    {
        // Arrange
        var service = new HealthRecordService(_context);
        var date = DateOnly.FromDateTime(DateTime.Now);
        var time = new TimeOnly(7, 0);

        var record1 = new MedicationRecord
        {
            Medication = "Aspirin",
            Dosage = "100mg",
            Schedule = MedicationSchedule.SevenAm,
            Date = date,
            Time = time
        };

        var record2 = new MedicationRecord
        {
            Medication = "Ibuprofen",
            Dosage = "200mg",
            Schedule = MedicationSchedule.SevenAm,
            Date = date,
            Time = time
        };

        // Act
        await service.AddMedicationRecordAsync(record1);
        var (success, message, _) = await service.AddMedicationRecordAsync(record2);

        // Assert
        success.Should().BeFalse();
        message.Should().Contain("already exists");
    }

    [Fact]
    public async Task GetMedicationRecordsByDate_WithExistingRecords_ShouldReturnAll()
    {
        // Arrange
        var service = new HealthRecordService(_context);
        var date = DateOnly.FromDateTime(DateTime.Now);

        var record1 = new MedicationRecord
        {
            Medication = "Aspirin",
            Dosage = "100mg",
            Schedule = MedicationSchedule.SevenAm,
            Date = date,
            Time = new TimeOnly(7, 0)
        };

        var record2 = new MedicationRecord
        {
            Medication = "Ibuprofen",
            Dosage = "200mg",
            Schedule = MedicationSchedule.ThreePm,
            Date = date,
            Time = new TimeOnly(15, 0)
        };

        await service.AddMedicationRecordAsync(record1);
        await service.AddMedicationRecordAsync(record2);

        // Act
        var records = await service.GetMedicationRecordsByDateAsync(date);

        // Assert
        records.Should().HaveCount(2);
        records.Should().BeInAscendingOrder(r => r.Time);
    }

    [Fact]
    public async Task GetDailySummary_WithMixedRecords_ShouldReturnAccurateCounts()
    {
        // Arrange
        var service = new HealthRecordService(_context);
        var date = DateOnly.FromDateTime(DateTime.Now);

        var med = new MedicationRecord
        {
            Medication = "Aspirin",
            Dosage = "100mg",
            Schedule = MedicationSchedule.SevenAm,
            Date = date,
            Time = new TimeOnly(7, 0)
        };

        var bottle = new BottleRecord
        {
            BottleSize = 250,
            Date = date,
            Time = new TimeOnly(8, 0)
        };

        var note = new NoteRecord
        {
            Note = "Feeling good",
            Date = date,
            Time = new TimeOnly(9, 0)
        };

        await service.AddMedicationRecordAsync(med);
        await service.AddBottleRecordAsync(bottle);
        await service.AddNoteRecordAsync(note);

        // Act
        var summary = await service.GetDailySummaryAsync(date);

        // Assert
        summary.TotalMedications.Should().Be(1);
        summary.TotalBottles.Should().Be(1);
        summary.TotalNotes.Should().Be(1);
        summary.AllRecords.Should().HaveCount(3);
    }
}
