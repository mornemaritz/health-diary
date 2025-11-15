using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthDiary.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BottleRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BottleSize = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BottleRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BowelMovementRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Size = table.Column<string>(type: "text", nullable: false),
                    Consistency = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BowelMovementRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicationRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Medication = table.Column<string>(type: "text", nullable: false),
                    Dosage = table.Column<string>(type: "text", nullable: false),
                    Schedule = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NoteRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SolidFoodRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Item = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolidFoodRecords", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BottleRecords_Date",
                table: "BottleRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_BowelMovementRecords_Date",
                table: "BowelMovementRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationRecords_Date",
                table: "MedicationRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_NoteRecords_Date",
                table: "NoteRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_SolidFoodRecords_Date",
                table: "SolidFoodRecords",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BottleRecords");

            migrationBuilder.DropTable(
                name: "BowelMovementRecords");

            migrationBuilder.DropTable(
                name: "MedicationRecords");

            migrationBuilder.DropTable(
                name: "NoteRecords");

            migrationBuilder.DropTable(
                name: "SolidFoodRecords");
        }
    }
}
