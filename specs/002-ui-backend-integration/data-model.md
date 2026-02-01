# Data Model: API Requests and Responses

**Date**: 2026-02-01  
**Feature**: UI-Backend API Integration  
**Purpose**: Define all TypeScript interfaces and data contracts between UI and backend

---

## Authentication Models

### AuthRequest

User login request to authenticate with email and password.

```typescript
interface AuthRequest {
  email: string;        // User email address (must be valid email format)
  password: string;     // User password (6+ characters)
}
```

**Validation Rules**:
- `email`: Required, valid email format (RFC 5322)
- `password`: Required, minimum 6 characters

---

### AuthResponse

Successful authentication response with JWT tokens.

```typescript
interface AuthResponse {
  accessToken: string;  // JWT access token (short-lived, e.g., 15 minutes)
  refreshToken: string; // JWT refresh token (long-lived, e.g., 7 days)
  expiresIn: number;    // Access token expiry in seconds
}
```

**Token Structure** (JWT with claims):
- `exp`: Token expiration timestamp (Unix epoch)
- `sub`: Subject (user ID)
- `aud`: Audience (must be "HealthDiaryUsers")
- `iss`: Issuer (must be "HealthDiary")

---

### RefreshTokenRequest

Request to obtain a new access token using a valid refresh token.

```typescript
interface RefreshTokenRequest {
  refreshToken: string; // Current refresh token
}
```

---

### RefreshTokenResponse

Response with new access token.

```typescript
interface RefreshTokenResponse {
  accessToken: string;  // New JWT access token
  expiresIn: number;    // Expiry in seconds
}
```

---

## Health Record Models

### MedicationAdministrationRequest

Request to create a medication administration record.

```typescript
interface MedicationAdministrationRequest {
  medication: string;                              // Drug name
  dosage: string;                                  // Amount and unit (e.g., "100mg")
  schedule: 'SevenAm' | 'ThreePm' | 'SevenPm' | 'TenPm' | 'AdHoc';  // Scheduled time
  date: string;                                    // Date in yyyy-MM-dd format
  time: string;                                    // Time in HH:mm:ss format
}
```

**Validation Rules**:
- `medication`: Required, non-empty string, max 255 characters
- `dosage`: Required, non-empty string, max 255 characters
- `schedule`: Required, must be one of the enum values
- `date`: Required, valid date in yyyy-MM-dd format (past or future)
- `time`: Required, valid time in HH:mm:ss format

**Unique Constraints**:
- Combination of (date, time, medication, schedule) must be unique per user
- Backend returns 409 Conflict if duplicate exists

---

### BottleConsumptionRequest

Request to create a hydration record.

```typescript
interface BottleConsumptionRequest {
  bottleSize: number;  // Volume in milliliters (e.g., 250, 500)
  date: string;        // Date in yyyy-MM-dd format
  time: string;        // Time in HH:mm:ss format
}
```

**Validation Rules**:
- `bottleSize`: Required, positive integer, typical range 100-2000 ml
- `date`: Required, valid date in yyyy-MM-dd format
- `time`: Required, valid time in HH:mm:ss format

**Unique Constraints**:
- Combination of (date, time) must be unique per user
- Backend returns 409 Conflict if duplicate exists

---

### BowelMovementRequest

Request to create a bowel movement record.

```typescript
interface BowelMovementRequest {
  size: string;         // Relative size category (e.g., "small", "medium", "large")
  consistency: string;  // Stool consistency (e.g., "firm", "normal", "loose", "watery")
  color: string;        // Stool color (e.g., "brown", "light", "dark")
  date: string;         // Date in yyyy-MM-dd format
  time: string;         // Time in HH:mm:ss format
}
```

**Validation Rules**:
- `size`, `consistency`, `color`: Required, non-empty strings, max 50 characters each
- `date`: Required, valid date in yyyy-MM-dd format
- `time`: Required, valid time in HH:mm:ss format

**Unique Constraints**:
- Combination of (date, time) must be unique per user
- Backend returns 409 Conflict if duplicate exists

---

### SolidFoodConsumptionRequest

Request to create a food intake record.

```typescript
interface SolidFoodConsumptionRequest {
  foodDescription: string;  // What was eaten (e.g., "oatmeal", "chicken salad")
  notes?: string;           // Optional notes about meal (max 500 characters)
  date: string;             // Date in yyyy-MM-dd format
  time: string;             // Time in HH:mm:ss format
}
```

**Validation Rules**:
- `foodDescription`: Required, non-empty string, max 255 characters
- `notes`: Optional, max 500 characters
- `date`: Required, valid date in yyyy-MM-dd format
- `time`: Required, valid time in HH:mm:ss format

**Unique Constraints**:
- Combination of (date, time) must be unique per user
- Backend returns 409 Conflict if duplicate exists

---

### ObservationRequest

Request to create an observation/note record.

```typescript
interface ObservationRequest {
  observation: string;  // Observation text (max 1000 characters)
  date: string;        // Date in yyyy-MM-dd format
  time: string;        // Time in HH:mm:ss format
}
```

**Validation Rules**:
- `observation`: Required, non-empty string, max 1000 characters
- `date`: Required, valid date in yyyy-MM-dd format
- `time`: Required, valid time in HH:mm:ss format

**Unique Constraints**:
- Combination of (date, time) must be unique per user
- Backend returns 409 Conflict if duplicate exists

---

### HealthRecordResponse

Base response model for any created health record.

```typescript
interface HealthRecordResponse {
  id: string;      // UUID of created record
  message: string; // Success message (e.g., "Medication record created successfully.")
}
```

---

## Summary Models

### DailySummary

Aggregated summary of all records for a specific date.

```typescript
interface DailySummary {
  date: string;                 // Date in yyyy-MM-dd format
  totalMedications: number;     // Count of medication records
  totalBottles: number;         // Count of hydration records
  totalBowelMovements: number;  // Count of bowel movement records
  totalFoodIntakes: number;     // Count of food intake records
  totalNotes: number;           // Count of observation records
  allRecords: HealthRecordDto[]; // List of all records
}
```

---

### HealthRecordDto

Individual health record in summary.

```typescript
interface HealthRecordDto {
  id: string;           // UUID of record
  date: string;         // Date in yyyy-MM-dd format
  time: string;         // Time in HH:mm:ss format
  recordType: string;   // Type: "Medication" | "Bottle" | "BowelMovement" | "SolidFood" | "Observation"
  summary: string;      // Human-readable summary (e.g., "Aspirin - 100mg (7am)")
}
```

---

## Medication Reference Data

### MedicationDosageGroup

Reference data for available medications by schedule.

```typescript
interface MedicationDosageGroup {
  medication: string;   // Drug name
  dosage: string;       // Standard dosage
  schedule: string;     // Schedule (7am, 3pm, 7pm, 10pm, adhoc)
}
```

**GET Endpoints**:
- `GET /api/health/medications/dosage-groups` → Returns all medication groups
- `GET /api/health/medications/dosage-groups/schedule/{schedule}` → Returns groups for specific schedule

**Example Response**:
```json
[
  {
    "medication": "Epilim",
    "dosage": "4ml",
    "schedule": "7am"
  },
  {
    "medication": "Gabapentin",
    "dosage": "300mg",
    "schedule": "7am"
  }
]
```

---

## Error Response Models

### ErrorResponse

Standard error response from backend.

```typescript
interface ErrorResponse {
  statusCode: number;        // HTTP status code (400, 401, 409, 500, etc.)
  message: string;           // Error message (should be user-friendly)
  details?: string[];        // Optional array of detailed error messages
}
```

**Common Error Scenarios**:

| Status | Message | Details |
|--------|---------|---------|
| 400 | "Date and Time are required." | ["Date format must be yyyy-MM-dd", "Time format must be HH:mm:ss"] |
| 401 | "Unauthorized" | ["Access token expired", "Invalid token"] |
| 409 | "A medication record already exists for this date and time." | ["Duplicate record: Aspirin at 2026-02-01 07:00:00"] |
| 500 | "Internal server error" | ["Database connection failed"] |

---

## API Client State

### ApiClientState

State managed by the HTTP client for each request.

```typescript
interface ApiClientState {
  isLoading: boolean;      // Request in progress
  error: ErrorResponse | null; // Error if request failed
  data: T | null;          // Response data if successful
  isRetrying: boolean;     // Automatic retry in progress
  retryCount: number;      // Number of retries attempted
}
```

---

### AuthState

Authentication state stored in React context or localStorage.

```typescript
interface AuthState {
  isAuthenticated: boolean;     // User is logged in
  accessToken: string | null;   // Current access token
  refreshToken: string | null;  // Current refresh token
  expiresAt: number | null;     // Token expiry timestamp (Unix epoch)
  user: UserInfo | null;        // Decoded user info from token
  isRefreshing: boolean;        // Token refresh in progress
}

interface UserInfo {
  sub: string;  // User ID from JWT `sub` claim
  email?: string; // User email (if included in token)
}
```

---

## Data Format Standards

### Date Format

- **Format**: `yyyy-MM-dd` (ISO 8601 date)
- **Example**: `2026-02-01`
- **Timezone**: Local date (no timezone conversion)
- **Validation**: Must be valid calendar date (past or future)

### Time Format

- **Format**: `HH:mm:ss` (24-hour ISO 8601 time)
- **Example**: `14:47:00` for 2:47 PM
- **Timezone**: Local time (no timezone conversion)
- **Validation**: Must be valid time (00:00:00 to 23:59:59)

### UUID Format

- **Format**: UUID v4 (36 characters)
- **Example**: `550e8400-e29b-41d4-a716-446655440000`
- **Usage**: Record IDs returned by backend

---

## Enumeration Values

### Schedule Enum

Medication schedule times for daily medication tracking.

```typescript
type MedicationSchedule = 'SevenAm' | 'ThreePm' | 'SevenPm' | 'TenPm' | 'AdHoc';

// Mapping for UI display:
const scheduleLabels: Record<MedicationSchedule, string> = {
  SevenAm: '7:00 AM',
  ThreePm: '3:00 PM',
  SevenPm: '7:00 PM',
  TenPm: '10:00 PM',
  AdHoc: 'As Needed'
};
```

### RecordType Enum

Types of health records in the system.

```typescript
type HealthRecordType = 'Medication' | 'Bottle' | 'BowelMovement' | 'SolidFood' | 'Observation';
```

---

## Relationships and Dependencies

```
User (authenticated via JWT)
  ├── MedicationAdministration (many)
  ├── BottleConsumption (many)
  ├── BowelMovement (many)
  ├── SolidFoodConsumption (many)
  └── Observation (many)

DailySummary
  └── HealthRecordDto[] (one per record type instance)
```

All health records belong to the authenticated user. Backend enforces user isolation (not visible in this feature but assumed to exist).

---

## Validation Rules Summary

| Field | Type | Required | Format | Max Length | Constraint |
|-------|------|----------|--------|------------|-----------|
| email | string | Yes | Email | 255 | Unique |
| password | string | Yes | 6+ chars | 255 | - |
| medication | string | Yes | - | 255 | Unique per date/time |
| dosage | string | Yes | - | 255 | - |
| schedule | enum | Yes | - | - | 5 values |
| date | string | Yes | yyyy-MM-dd | 10 | Valid date |
| time | string | Yes | HH:mm:ss | 8 | Valid time |
| bottleSize | number | Yes | Positive int | - | 100-2000 |
| size | string | Yes | - | 50 | - |
| consistency | string | Yes | - | 50 | - |
| color | string | Yes | - | 50 | - |
| foodDescription | string | Yes | - | 255 | - |
| notes | string | No | - | 500 | - |
| observation | string | Yes | - | 1000 | - |
