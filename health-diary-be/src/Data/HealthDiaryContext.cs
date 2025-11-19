using Microsoft.EntityFrameworkCore;
using HealthDiary.Api.Models;

namespace HealthDiary.Api.Data;

/// <summary>
/// Entity Framework Core DbContext for Health Diary.
/// </summary>
public class HealthDiaryContext : DbContext
{
    public HealthDiaryContext(DbContextOptions<HealthDiaryContext> options) : base(options) { }

    public DbSet<MedicationAdministration> MedicationAdministrations { get; set; } = null!;
    public DbSet<BottleConsumption> Bottles { get; set; } = null!;
    public DbSet<BowelMovement> BowelMovements { get; set; } = null!;
    public DbSet<SolidFoodConsumption> SolidFoods { get; set; } = null!;
    public DbSet<Observation> Observations { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure MedicationRecord
        modelBuilder.Entity<MedicationAdministration>()
            .HasKey(m => m.Id);
        modelBuilder.Entity<MedicationAdministration>()
            .Property(m => m.Schedule)
            .HasConversion<string>();
        modelBuilder.Entity<MedicationAdministration>()
            .HasIndex(m => m.Date);

        // Configure BottleRecord
        modelBuilder.Entity<BottleConsumption>()
            .HasKey(b => b.Id);
        modelBuilder.Entity<BottleConsumption>()
            .HasIndex(b => b.Date);

        // Configure BowelMovementRecord
        modelBuilder.Entity<BowelMovement>()
            .HasKey(b => b.Id);
        modelBuilder.Entity<BowelMovement>()
            .HasIndex(b => b.Date);

        // Configure SolidFoodRecord
        modelBuilder.Entity<SolidFoodConsumption>()
            .HasKey(s => s.Id);
        modelBuilder.Entity<SolidFoodConsumption>()
            .HasIndex(s => s.Date);

        // Configure NoteRecord
        modelBuilder.Entity<Observation>()
            .HasKey(n => n.Id);
        modelBuilder.Entity<Observation>()
            .HasIndex(n => n.Date);
    }
}
