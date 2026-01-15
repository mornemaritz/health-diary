using Microsoft.EntityFrameworkCore;
using HealthDiary.Api.Models;

namespace HealthDiary.Api.Data;

/// <summary>
/// Entity Framework Core DbContext for Health Diary.
/// </summary>
public class HealthDiaryContext : DbContext
{
    public HealthDiaryContext(DbContextOptions<HealthDiaryContext> options) : base(options) { }

    public DbSet<MedicationDosageGroup> MedicationDosageGroups { get; set; } = null!;
    public DbSet<MedicationAdministration> MedicationAdministrations { get; set; } = null!;
    public DbSet<BottleConsumption> Bottles { get; set; } = null!;
    public DbSet<BowelMovement> BowelMovements { get; set; } = null!;
    public DbSet<SolidFoodConsumption> SolidFoods { get; set; } = null!;
    public DbSet<Observation> Observations { get; set; } = null!;

    // Authentication entities
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<InviteLink> InviteLinks { get; set; } = null!;
    public DbSet<PasswordResetLink> PasswordResetLinks { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MedicationDosageGroup>()
            .HasKey(m => m.Id);
        modelBuilder.Entity<MedicationDosageGroup>()
            .HasIndex(m => new { m.Medication, m.Dosage, m.Schedule })
            .IsUnique();

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

        // Configure User
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>()
            .HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>()
            .HasMany(u => u.PasswordResetLinks)
            .WithOne(prl => prl.User)
            .HasForeignKey(prl => prl.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure InviteLink
        modelBuilder.Entity<InviteLink>()
            .HasKey(il => il.Id);
        modelBuilder.Entity<InviteLink>()
            .HasIndex(il => il.Token).IsUnique();
        modelBuilder.Entity<InviteLink>()
            .HasIndex(il => il.Email);
        modelBuilder.Entity<InviteLink>()
            .HasOne(il => il.Creator)
            .WithMany(u => u.CreatedInviteLinks)
            .HasForeignKey(il => il.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure PasswordResetLink
        modelBuilder.Entity<PasswordResetLink>()
            .HasKey(prl => prl.Id);
        modelBuilder.Entity<PasswordResetLink>()
            .HasIndex(prl => prl.Token).IsUnique();

        // Configure RefreshToken
        modelBuilder.Entity<RefreshToken>()
            .HasKey(rt => rt.Id);
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token).IsUnique();
    }
}
