using HealthDiary.Api.Models;
using HealthDiary.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HealthDiary.Api.Services;

/// <summary>
/// Service for managing health records and daily summaries.
/// </summary>
public interface IHealthRecordService
{
    Task<(bool Success, string Message, Guid? RecordId)> AddMedicationAdministrationAsync(MedicationAdministration record);
    Task<(bool Success, string Message, Guid? RecordId)> AddBottleConsumptionAsync(BottleConsumption record);
    Task<(bool Success, string Message, Guid? RecordId)> AddBowelMovementAsync(BowelMovement record);
    Task<(bool Success, string Message, Guid? RecordId)> AddSolidFoodIntakeAsync(SolidFoodConsumption record);
    Task<(bool Success, string Message, Guid? RecordId)> AddObservationAsync(Observation record);
    
    Task<List<MedicationAdministration>> GetMedicationAdministrationsByDateAsync(DateOnly date);
    Task<List<BottleConsumption>> GetBottleConsumptionsByDateAsync(DateOnly date);
    Task<List<BowelMovement>> GetBowelMovementsByDateAsync(DateOnly date);
    Task<List<SolidFoodConsumption>> GetSolidFoodIntakesByDateAsync(DateOnly date);
    Task<List<Observation>> GetObservationsByDateAsync(DateOnly date);
    
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
    private async Task<bool> HealthRecordExistsAsync<T>(DateOnly date, TimeOnly time) where T : HealthRecord
    {
        return await _context.Set<T>()
            .AnyAsync(r => r.Date == date && r.Time == time);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddMedicationAdministrationAsync(MedicationAdministration record)
    {
        if (await HealthRecordExistsAsync<MedicationAdministration>(record.Date, record.Time))
            return (false, "A medication record already exists for this date and time.", null);

        _context.MedicationAdministrations.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Medication record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddBottleConsumptionAsync(BottleConsumption record)
    {
        if (await HealthRecordExistsAsync<BottleConsumption>(record.Date, record.Time))
            return (false, "A bottle record already exists for this date and time.", null);

        _context.Bottles.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Bottle record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddBowelMovementAsync(BowelMovement record)
    {
        if (await HealthRecordExistsAsync<BowelMovement>(record.Date, record.Time))
            return (false, "A bowel movement record already exists for this date and time.", null);

        _context.BowelMovements.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Bowel movement record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddSolidFoodIntakeAsync(SolidFoodConsumption record)
    {
        if (await HealthRecordExistsAsync<SolidFoodConsumption>(record.Date, record.Time))
            return (false, "A solid food record already exists for this date and time.", null);

        _context.SolidFoods.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Solid food record created successfully.", record.Id);
    }

    public async Task<(bool Success, string Message, Guid? RecordId)> AddObservationAsync(Observation record)
    {
        if (await HealthRecordExistsAsync<Observation>(record.Date, record.Time))
            return (false, "A note record already exists for this date and time.", null);

        _context.Observations.Add(record);
        await _context.SaveChangesAsync();
        return (true, "Note record created successfully.", record.Id);
    }

    public async Task<List<MedicationAdministration>> GetMedicationAdministrationsByDateAsync(DateOnly date)
    {
        return await _context.MedicationAdministrations
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<BottleConsumption>> GetBottleConsumptionsByDateAsync(DateOnly date)
    {
        return await _context.Bottles
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<BowelMovement>> GetBowelMovementsByDateAsync(DateOnly date)
    {
        return await _context.BowelMovements
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<SolidFoodConsumption>> GetSolidFoodIntakesByDateAsync(DateOnly date)
    {
        return await _context.SolidFoods
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<List<Observation>> GetObservationsByDateAsync(DateOnly date)
    {
        return await _context.Observations
            .Where(r => r.Date == date)
            .OrderBy(r => r.Time)
            .ToListAsync();
    }

    public async Task<DailySummary> GetDailySummaryAsync(DateOnly date)
    {
        var medications = await GetMedicationAdministrationsByDateAsync(date);
        var bottles = await GetBottleConsumptionsByDateAsync(date);
        var bowelMovements = await GetBowelMovementsByDateAsync(date);
        var solidFoods = await GetSolidFoodIntakesByDateAsync(date);
        var notes = await GetObservationsByDateAsync(date);

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
