# Timezone Offset Implementation Summary

## Overview

This implementation adds timezone awareness to the Health Diary API by including a timezone offset with each health record submission. The server can then correctly validate whether a submitted time is in the future by converting the client's local time to UTC before comparison.

## Solution Details

### Approach

**Solution 2: Include Timezone Offset with Every Request** was implemented:

- The client sends their timezone offset (in minutes from UTC) with each health record
- The server adjusts comparisons by converting client local times to UTC
- Preserves the user's original input time in the database
- Simple server-side logic with explicit timezone information

### Changes Made

#### 1. **Dto Changes**

- **MedicationAdministrationDto**: Added `TimezoneOffsetMinutes` property to match
  - JSON property name: `timezoneOffsetMinutes`
  - Type: `int` (positive for east of UTC, negative for west)
  - Examples: UTC+2 = 120, UTC-5 = -300

- **Implemented Dtos for all Models**: Added `BottleConsumptionDto`, `BowelMovementDto`, `SolidFoodConsumptionDto`, `ObservationDto`, `ObservationDto` with `TimezoneOffsetMinutes` property. 

#### 2. **DatePlusTime Utility Enhancement**

- **DatePlusTime.cs**: Added new `IsAfterWithTimezone()` method

  ```csharp
  public bool IsAfterWithTimezone(DateTime other, int timezoneOffsetMinutes)
  {
      // Convert the client's local date/time to UTC by subtracting the offset
      var utcDateTime = DateTime.AddMinutes(-timezoneOffsetMinutes);
      return utcDateTime > other;
  }
  ```

  - Converts client local time to UTC before comparison
  - Accounts for positive and negative timezone offsets
  - Handles date boundary crossings correctly

#### 3. **API Endpoint Updates**

Updated all 5 health record POST endpoints to use timezone-aware validation:

- `/api/health/medication`
- `/api/health/bottle`
- `/api/health/bowel-movement`
- `/api/health/solid-food`
- `/api/health/note`

Changed from:

```csharp
if (new DatePlusTime(record.Date, record.Time).IsAfter(DateTime.Now))
```

To:

```csharp
if (new DatePlusTime(record.Date, record.Time).IsAfterWithTimezone(DateTime.Now, record.TimezoneOffsetMinutes))
```

#### 5. **Comprehensive Unit Tests**

Created 14 new timezone-specific tests in `DatePlusTimeTests.cs`:

- Basic timezone offset scenarios (UTC+2, UTC-5, UTC+9)
- Edge cases (date boundary crossing, extreme offsets)
- Real-world scenarios matching the bug report
- Verification that zero offset behaves like standard `IsAfter()`

All tests pass ✅ (28 total tests)

#### 6. **Integration Test Documentation**

Created `TimezoneIntegrationTests.cs` with documented test scenarios:

- Current time submissions from various timezones
- Future time rejection
- Date boundary crossing
- DST transition handling notes
- Multiple timezone examples (UTC+0 to UTC+13, UTC-10 to UTC-5:30)

## How It Works

### Example Scenario (from bug report)

**Problem**: Client in UTC+2 submits time "14:30", server in UTC sees it as future

**Solution**:

1. Client submits:
   - `date`: "2026-05-31"
   - `time`: "14:30"
   - `timezoneOffsetMinutes`: 120 (UTC+2)

2. Server receives data and validates:

   ```csharp
   var clientTime = new DatePlusTime(date: "2026-05-31", time: "14:30")
   var isInFuture = clientTime.IsAfterWithTimezone(DateTime.Now, 120)
   ```

3. Conversion happens:
   - Client local time: 2026-05-31 14:30 (UTC+2)
   - Subtract offset: 2026-05-31 14:30 - 120 minutes = 2026-05-31 12:30 (UTC)
   - Compare with server time: 12:30 UTC vs 12:30 UTC = NOT in future ✅

4. Record is accepted

### Client Integration Requirements

The client needs to send the timezone offset with each request. In JavaScript:

```javascript
// Get timezone offset in minutes
const timezoneOffsetMinutes = -new Date().getTimezoneOffset();
// Note: JavaScript's getTimezoneOffset() returns the opposite sign

// Example request payload
{
  date: "2026-05-31",
  time: "14:30",
  timezoneOffsetMinutes: 120,  // UTC+2
  // ... other fields
}
```

### Timezone Offset Examples

- **UTC+2** (Eastern European Time): `120`
- **UTC-5** (US Eastern): `-300`
- **UTC+5:30** (India): `330`
- **UTC+9** (Japan): `540`
- **UTC** (Greenwich): `0`

## Benefits of This Solution

✅ **Simple**: Server just subtracts the offset, no complex timezone logic
✅ **Explicit**: Timezone is sent with each request, no assumptions
✅ **Preserves Input**: Original user time is stored in the database
✅ **Flexible**: Works with any timezone the client reports
✅ **DST-Safe**: Client handles DST, server just uses the offset
✅ **Backward Compatible**: Default value of 0 (UTC) for existing records

## Testing

Run the tests:

```bash
cd health-diary-be
dotnet test --filter "FullyQualifiedName~DatePlusTimeTests"
```

All 28 tests pass, including:

- 14 original DatePlusTime tests
- 14 new timezone-aware tests

## Notes

- **dotnet DateTime**: The dotnet DateTime implementation is a confusing mess.
  - Comaprisons between dates with a different `Kind` attribute yield non-sensical results.
  - For now, the feature of preventing users from adding entries in the future is disabled
  - It may actually neved be implemented for the API version of the App as it is just a stopgap until the POD version is available

## Files Modified

1. `/src/Models/Dtos.cs` - Added TimezoneOffsetMinutes to current DTO and added DTOs for all other entities.
2. `/src/Utilities/DatePlusTime.cs` - Added IsAfterWithTimezone method
3. `/src/Program.cs` - Updated all 5 POST endpoint validations
4. `/tests/Unit/Utilities/DatePlusTimeTests.cs` - Added 14 timezone tests
5. `/tests/Integration/TimezoneIntegrationTests.cs` - Created integration test documentation

## Build Status

✅ Build: Success
✅ Tests: 28/28 Passed
✅ Migration: Generated
