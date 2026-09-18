using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthDiary.Api.Migrations
{
    /// <inheritdoc />
    public partial class MedicationDosage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage_Schedule",
                table: "MedicationDosageGroups");

            migrationBuilder.DropColumn(
                name: "Dosage",
                table: "MedicationDosageGroups");

            migrationBuilder.DropColumn(
                name: "Medication",
                table: "MedicationDosageGroups");

            migrationBuilder.DropColumn(
                name: "Dosage",
                table: "MedicationAdministrations");

            migrationBuilder.DropColumn(
                name: "Medication",
                table: "MedicationAdministrations");

            migrationBuilder.AddColumn<Guid>(
                name: "MedicationId",
                table: "MedicationDosageGroups",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "MedicationDosageId",
                table: "MedicationAdministrations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "MedicationDosages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Medication = table.Column<string>(type: "text", nullable: false),
                    Dosage = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationDosages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDosageGroups_MedicationId_Schedule",
                table: "MedicationDosageGroups",
                columns: new[] { "MedicationId", "Schedule" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicationAdministrations_MedicationDosageId",
                table: "MedicationAdministrations",
                column: "MedicationDosageId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDosages_Medication_Dosage",
                table: "MedicationDosages",
                columns: new[] { "Medication", "Dosage" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationAdministrations_MedicationDosages_MedicationDosag~",
                table: "MedicationAdministrations",
                column: "MedicationDosageId",
                principalTable: "MedicationDosages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationDosageGroups_MedicationDosages_MedicationId",
                table: "MedicationDosageGroups",
                column: "MedicationId",
                principalTable: "MedicationDosages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationAdministrations_MedicationDosages_MedicationDosag~",
                table: "MedicationAdministrations");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicationDosageGroups_MedicationDosages_MedicationId",
                table: "MedicationDosageGroups");

            migrationBuilder.DropTable(
                name: "MedicationDosages");

            migrationBuilder.DropIndex(
                name: "IX_MedicationDosageGroups_MedicationId_Schedule",
                table: "MedicationDosageGroups");

            migrationBuilder.DropIndex(
                name: "IX_MedicationAdministrations_MedicationDosageId",
                table: "MedicationAdministrations");

            migrationBuilder.DropColumn(
                name: "MedicationId",
                table: "MedicationDosageGroups");

            migrationBuilder.DropColumn(
                name: "MedicationDosageId",
                table: "MedicationAdministrations");

            migrationBuilder.AddColumn<string>(
                name: "Dosage",
                table: "MedicationDosageGroups",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Medication",
                table: "MedicationDosageGroups",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Dosage",
                table: "MedicationAdministrations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Medication",
                table: "MedicationAdministrations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDosageGroups_Medication_Dosage_Schedule",
                table: "MedicationDosageGroups",
                columns: new[] { "Medication", "Dosage", "Schedule" },
                unique: true);
        }
    }
}
