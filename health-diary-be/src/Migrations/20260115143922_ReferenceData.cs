using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthDiary.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReferenceData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MedicationDosageGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Medication = table.Column<string>(type: "text", nullable: false),
                    Dosage = table.Column<string>(type: "text", nullable: false),
                    Schedule = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationDosageGroups", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage",
                table: "MedicationDosageGroups",
                columns: new[] { "Medication", "Dosage" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicationDosageGroups");
        }
    }
}
