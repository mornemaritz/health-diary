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

  Task<List<MedicationDosageGroup>> GetAllMedicationDosageGroupsAsync();
  Task<List<MedicationDosageGroup>> GetMedicationDosageGroupsByScheduleAsync(MedicationSchedule schedule);
  Task<List<MedicationAdministration>> GetMedicationAdministrationsByDateAsync(DateOnly date);
  Task<List<BottleConsumption>> GetBottleConsumptionsByDateAsync(DateOnly date);
  Task<List<BowelMovement>> GetBowelMovementsByDateAsync(DateOnly date);
  Task<List<SolidFoodConsumption>> GetSolidFoodIntakesByDateAsync(DateOnly date);
  Task<List<Observation>> GetObservationsByDateAsync(DateOnly date);

  Task<DailySummary> GetDailySummaryAsync(DatePlusTime datePlusTime);
  Task<MedicationDosage?> GetMedicationDosageAsync(string medication, string dosage, MedicationSchedule schedule);
}

public class HealthRecordService(HealthDiaryContext context) : IHealthRecordService
{
  private readonly HealthDiaryContext _context = context;

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
    if (await _context.MedicationAdministrations.AnyAsync(r =>
        r.Date == record.Date
        && r.Time == record.Time
        && r.MedicationDosage.Medication == record.MedicationDosage.Medication
        && r.MedicationDosage.Dosage == record.MedicationDosage.Dosage
        && r.Schedule == record.Schedule))

      return (false, $"A medication record already exists for {record.MedicationDosage.Medication} at this date and time.", null);

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
        .Include(m => m.MedicationDosage)
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

  public async Task<DailySummary> GetDailySummaryAsync(DatePlusTime datePlusTime)
  {
    var medications = await GetMedicationAdministrationsByDateAsync(datePlusTime.Date);
    var bottles = await GetBottleConsumptionsByDateAsync(datePlusTime.Date);
    var bowelMovements = await GetBowelMovementsByDateAsync(datePlusTime.Date);
    var solidFoods = await GetSolidFoodIntakesByDateAsync(datePlusTime.Date);
    var notes = await GetObservationsByDateAsync(datePlusTime.Date);

    var healthEntrySets = new List<HealthEntrySet>
    {
      MedicationAdministration.EntrySet(medications, datePlusTime),
      BottleConsumption.EntrySet(bottles, datePlusTime),
      BowelMovement.EntrySet(bowelMovements, datePlusTime),
      SolidFoodConsumption.EntrySet(solidFoods, datePlusTime),
      Observation.EntrySet(notes, datePlusTime)
    };

    return new DailySummary
    {
      Date = datePlusTime.Date,
      HealthEntrySets = [.. healthEntrySets]
    };
  }

  public async Task<List<MedicationDosageGroup>> GetAllMedicationDosageGroupsAsync()
  {
    return await _context.MedicationDosageGroups.Include(mdg => mdg.MedicationDosage).ToListAsync();
  }

  public async Task<List<MedicationDosageGroup>> GetMedicationDosageGroupsByScheduleAsync(MedicationSchedule schedule)
  {
    return await _context.MedicationDosageGroups
        .Where(m => m.Schedule == schedule)
        .ToListAsync();
  }

  public async Task<MedicationDosage?> GetMedicationDosageAsync(string medication, string dosage, MedicationSchedule schedule)
  {
    return await _context.MedicationDosageGroups
        .Where(mdg => mdg.Schedule == schedule
            && mdg.MedicationDosage.Medication == medication
            && mdg.MedicationDosage.Dosage == dosage)
        .Select(mdg => mdg.MedicationDosage)
        .FirstOrDefaultAsync(mdg => mdg != null);
  }
}
