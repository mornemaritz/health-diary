# Health Events API - Data Model

## Entity Relationships

All health records inherit from a base `HealthRecord` class and are stored in separate tables indexed by date for efficient querying.

## Entities

### HealthRecord (Base Class)
```
Id: Guid (Primary Key)
Date: DateOnly
Time: TimeOnly
```

### MedicationRecord
**Table:** `MedicationRecords`

```
Id: Guid (Primary Key)
Date: DateOnly (Indexed)
Time: TimeOnly
Medication: string (required)
Dosage: string (required)
Schedule: MedicationSchedule enum (required)
```

**Schedule Options:**
- `SevenAm` (7am)
- `ThreePm` (3pm)
- `SevenPm` (7pm)
- `TenPm` (10pm)
- `AdHoc` (ad hoc/as needed)

**Example:**
```csharp
new MedicationRecord
{
    Medication = "Aspirin",
    Dosage = "100mg",
    Schedule = MedicationSchedule.SevenAm,
    Date = DateOnly.FromDateTime(DateTime.Now),
    Time = new TimeOnly(7, 0)
}
```

---

### BottleRecord
**Table:** `BottleRecords`

```
Id: Guid (Primary Key)
Date: DateOnly (Indexed)
Time: TimeOnly
BottleSize: int (in milliliters)
```

**Example:**
```csharp
new BottleRecord
{
    BottleSize = 250,
    Date = DateOnly.FromDateTime(DateTime.Now),
    Time = new TimeOnly(8, 0)
}
```

---

### BowelMovementRecord
**Table:** `BowelMovementRecords`

```
Id: Guid (Primary Key)
Date: DateOnly (Indexed)
Time: TimeOnly
Size: string (required) - e.g., "small", "medium", "large"
Consistency: string (required) - e.g., "hard", "normal", "loose"
Color: string (required) - e.g., "brown", "dark", "light"
```

**Example:**
```csharp
new BowelMovementRecord
{
    Size = "large",
    Consistency = "normal",
    Color = "brown",
    Date = DateOnly.FromDateTime(DateTime.Now),
    Time = new TimeOnly(9, 0)
}
```

---

### SolidFoodRecord
**Table:** `SolidFoodRecords`

```
Id: Guid (Primary Key)
Date: DateOnly (Indexed)
Time: TimeOnly
Item: string (required) - e.g., "Oatmeal", "Chicken breast"
Size: string (required) - e.g., "small", "medium", "large"
Notes: string (optional) - e.g., "With berries", "Spicy"
```

**Example:**
```csharp
new SolidFoodRecord
{
    Item = "Oatmeal",
    Size = "small",
    Notes = "With berries",
    Date = DateOnly.FromDateTime(DateTime.Now),
    Time = new TimeOnly(8, 30)
}
```

---

### NoteRecord
**Table:** `NoteRecords`

```
Id: Guid (Primary Key)
Date: DateOnly (Indexed)
Time: TimeOnly
Note: string (required) - e.g., "Feeling great!", "Mild stomach ache"
```

**Example:**
```csharp
new NoteRecord
{
    Note = "Feeling great today!",
    Date = DateOnly.FromDateTime(DateTime.Now),
    Time = new TimeOnly(10, 0)
}
```

---

## Database Schema

### Tables and Indexes

All record tables follow the same pattern:

```sql
CREATE TABLE [RecordType]Records (
    Id UUID PRIMARY KEY,
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    [type-specific columns]
);

CREATE INDEX IX_[RecordType]Records_Date ON [RecordType]Records(Date);
```

**Indexes:**
- `IX_MedicationRecords_Date` - Optimizes date-based queries for medications
- `IX_BottleRecords_Date` - Optimizes date-based queries for hydration
- `IX_BowelMovementRecords_Date` - Optimizes date-based queries for bowel movements
- `IX_SolidFoodRecords_Date` - Optimizes date-based queries for food intake
- `IX_NoteRecords_Date` - Optimizes date-based queries for notes

---

## Duplicate Detection

Duplicate records are detected at the (Date, Time, RecordType) level:
- Cannot create two `MedicationRecord`s with the same Date and Time
- Cannot create two `BottleRecord`s with the same Date and Time
- And so on for all record types

This ensures each time slot per record type is unique within a day.

---

## Query Patterns

### Get All Records for a Date
```csharp
var medications = dbContext.MedicationRecords
    .Where(r => r.Date == targetDate)
    .OrderBy(r => r.Time)
    .ToListAsync();
```

### Get Daily Summary
```csharp
var summary = new DailySummary
{
    Date = targetDate,
    TotalMedications = medications.Count,
    TotalBottles = bottles.Count,
    TotalBowelMovements = bowelMovements.Count,
    TotalFoodIntakes = solidFoods.Count,
    TotalNotes = notes.Count,
    AllRecords = allRecords.OrderBy(r => r.Time).ToList()
};
```

---

## Performance Considerations

1. **Date Indexing**: All tables are indexed on `Date` to support efficient range queries.
2. **Separate Tables**: Each record type is stored in a separate table to optimize queries for specific types.
3. **Duplicate Prevention**: Handled at the application layer to return 409 Conflict responses.
4. **Ordering**: Records are ordered by `Time` within a date for consistent retrieval.

---

## Future Enhancements

- User/Patient ID for multi-user support
- Soft deletes for data retention/GDPR compliance
- Audit logging for compliance
- Data aggregation views for reporting
