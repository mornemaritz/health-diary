using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthDiary.Api.Migrations
{
    /// <inheritdoc />
    public partial class MedicationDosageGroupUniqueKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage",
                table: "MedicationDosageGroups");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage_Schedule",
                table: "MedicationDosageGroups",
                columns: new[] { "Medication", "Dosage", "Schedule" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage_Schedule",
                table: "MedicationDosageGroups");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage",
                table: "MedicationDosageGroups",
                columns: new[] { "Medication", "Dosage" },
                unique: true);
        }
    }
}
