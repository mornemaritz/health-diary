using Microsoft.EntityFrameworkCore;
using HealthDiary.Api.Models;

namespace HealthDiary.Api.Data;

/// <summary>
/// Entity Framework Core DbContext for Health Diary.
/// </summary>
public class HealthDiaryContext : DbContext
{
    public HealthDiaryContext(DbContextOptions<HealthDiaryContext> options) : base(options) { }

    public DbSet<MedicationRecord> MedicationRecords { get; set; } = null!;
    public DbSet<BottleRecord> BottleRecords { get; set; } = null!;
    public DbSet<BowelMovementRecord> BowelMovementRecords { get; set; } = null!;
    public DbSet<SolidFoodRecord> SolidFoodRecords { get; set; } = null!;
    public DbSet<NoteRecord> NoteRecords { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure MedicationRecord
        modelBuilder.Entity<MedicationRecord>()
            .HasKey(m => m.Id);
        modelBuilder.Entity<MedicationRecord>()
            .Property(m => m.Schedule)
            .HasConversion<string>();
        modelBuilder.Entity<MedicationRecord>()
            .HasIndex(m => m.Date);

        // Configure BottleRecord
        modelBuilder.Entity<BottleRecord>()
            .HasKey(b => b.Id);
        modelBuilder.Entity<BottleRecord>()
            .HasIndex(b => b.Date);

        // Configure BowelMovementRecord
        modelBuilder.Entity<BowelMovementRecord>()
            .HasKey(b => b.Id);
        modelBuilder.Entity<BowelMovementRecord>()
            .HasIndex(b => b.Date);

        // Configure SolidFoodRecord
        modelBuilder.Entity<SolidFoodRecord>()
            .HasKey(s => s.Id);
        modelBuilder.Entity<SolidFoodRecord>()
            .HasIndex(s => s.Date);

        // Configure NoteRecord
        modelBuilder.Entity<NoteRecord>()
            .HasKey(n => n.Id);
        modelBuilder.Entity<NoteRecord>()
            .HasIndex(n => n.Date);
    }
}
