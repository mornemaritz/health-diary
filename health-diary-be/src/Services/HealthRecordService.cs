using HealthDiary.Api.Models;
using HealthDiary.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HealthDiary.Api.Services;

/// <summary>
/// Service for managing health records and daily summaries.
/// </summary>
public interface IHealthRecordService
{
    Task<(bool Success, string Message, Guid? RecordId)> AddMedicationRecordAsync(MedicationRecord record);
    Task<(bool Success, string Message, Guid? RecordId)> AddBottleRecordAsync(BottleRecord record);
    Task<(bool Success, string Message, Guid? RecordId)> AddBowelMovementRecordAsync(BowelMovementRecord record);
    Task<(bool Success, string Message, Guid? RecordId)> AddSolidFoodRecordAsync(SolidFoodRecord record);
    Task<(bool Success, string Message, Guid? RecordId)> AddNoteRecordAsync(NoteRecord record);
    
    Task<List<MedicationRecord>> GetMedicationRecordsByDateAsync(DateOnly date);
    Task<List<BottleRecord>> GetBottleRecordsByDateAsync(DateOnly date);
    Task<List<BowelMovementRecord>> GetBowelMovementRecordsByDateAsync(DateOnly date);
    Task<List<SolidFoodRecord>> GetSolidFoodRecordsByDateAsync(DateOnly date);
    Task<List<NoteRecord>> GetNoteRecordsByDateAsync(DateOnly date);
    
    Task<DailySummary> GetDailySummaryAsync(DateOnly date);
}

public class HealthRecordService : IHealthRecordService
{
    private readonly HealthDiaryContext _context;

    public HealthRecordService(HealthDiaryContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Checks if a duplicate record already exists for the date, time, and type.
    /// </summary>
    private async Task<bool> RecordExistsAsync<T>(DateOnly date, TimeOnly time) where T : HealthRecord
    {
        return await _context.Set<T>()
            .AnyAsync(r => r.Date == date && r.Time == time);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddMedicationRecordAsync(MedicationRecord record)
    {
        if (await RecordExistsAsync<MedicationRecord>(record.Date, record.Time))
            return (false, "A medication record already exists for this date and time.", null);

        _context.MedicationRecords.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Medication record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddBottleRecordAsync(BottleRecord record)
    {
        if (await RecordExistsAsync<BottleRecord>(record.Date, record.Time))
            return (false, "A bottle record already exists for this date and time.", null);

        _context.BottleRecords.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Bottle record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddBowelMovementRecordAsync(BowelMovementRecord record)
    {
        if (await RecordExistsAsync<BowelMovementRecord>(record.Date, record.Time))
            return (false, "A bowel movement record already exists for this date and time.", null);

        _context.BowelMovementRecords.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Bowel movement record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddSolidFoodRecordAsync(SolidFoodRecord record)
    {
        if (await RecordExistsAsync<SolidFoodRecord>(record.Date, record.Time))
            return (false, "A solid food record already exists for this date and time.", null);

        _context.SolidFoodRecords.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Solid food record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddNoteRecordAsync(NoteRecord record)
    {
        if (await RecordExistsAsync<NoteRecord>(record.Date, record.Time))
            return (false, "A note record already exists for this date and time.", null);

        _context.NoteRecords.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Note record created successfully.", record.Id);
    }

    public async Task<List<MedicationRecord>> GetMedicationRecordsByDateAsync(DateOnly date)
    {
        return await _context.MedicationRecords
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<BottleRecord>> GetBottleRecordsByDateAsync(DateOnly date)
    {
        return await _context.BottleRecords
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<BowelMovementRecord>> GetBowelMovementRecordsByDateAsync(DateOnly date)
    {
        return await _context.BowelMovementRecords
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<SolidFoodRecord>> GetSolidFoodRecordsByDateAsync(DateOnly date)
    {
        return await _context.SolidFoodRecords
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<NoteRecord>> GetNoteRecordsByDateAsync(DateOnly date)
    {
        return await _context.NoteRecords
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<DailySummary> GetDailySummaryAsync(DateOnly date)
    {
        var medications = await GetMedicationRecordsByDateAsync(date);
        var bottles = await GetBottleRecordsByDateAsync(date);
        var bowelMovements = await GetBowelMovementRecordsByDateAsync(date);
        var solidFoods = await GetSolidFoodRecordsByDateAsync(date);
        var notes = await GetNoteRecordsByDateAsync(date);

        var allRecords = new List<HealthRecordDto>();
        allRecords.AddRange(medications.Select(m => new HealthRecordDto { Id = m.Id, Date = m.Date, Time = m.Time, RecordType = "Medication" }));
        allRecords.AddRange(bottles.Select(b => new HealthRecordDto { Id = b.Id, Date = b.Date, Time = b.Time, RecordType = "Bottle" }));
        allRecords.AddRange(bowelMovements.Select(b => new HealthRecordDto { Id = b.Id, Date = b.Date, Time = b.Time, RecordType = "BowelMovement" }));
        allRecords.AddRange(solidFoods.Select(s => new HealthRecordDto { Id = s.Id, Date = s.Date, Time = s.Time, RecordType = "SolidFood" }));
        allRecords.AddRange(notes.Select(n => new HealthRecordDto { Id = n.Id, Date = n.Date, Time = n.Time, RecordType = "Note" }));

        return new DailySummary
        {
            Date = date,
            TotalMedications = medications.Count,
            TotalBottles = bottles.Count,
            TotalBowelMovements = bowelMovements.Count,
            TotalFoodIntakes = solidFoods.Count,
            TotalNotes = notes.Count,
            AllRecords = allRecords.OrderBy(r => r.Time).ToList()
        };
    }
}
