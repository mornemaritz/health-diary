# Data Model: Frontend-Backend API Integration

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Source**: OpenAPI 3.0.0 specification (health-diary-be/openapi.yaml)

## Overview

This document defines the data models and DTOs used in the frontend-backend integration. All models are derived from the OpenAPI 3.0.0 specification and represent the contract between the JavaScript frontend and C# .NET9 REST API.

---

## Authentication Models

### User

Represents a registered user in the system.

```typescript
interface User {
  id: string;              // UUID format
  email: string;           // Email address, unique, format: email
  username: string;        // Unique username, 3-50 chars, pattern: ^[a-zA-Z0-9_-]+$
  name: string;            // User's full name
}
```

**Validation Rules**:
- `email`: Must be valid email format (RFC 5322)
- `username`: 3-50 characters, alphanumeric with hyphens/underscores only
- `name`: Non-empty string (no specific length constraint in spec)

**Relationships**:
- One-to-many with HealthRecord (a user has multiple health records)
- One-to-one with current AuthTokens

---

### AuthTokens

JWT token pair issued upon successful authentication.

```typescript
interface AuthTokens {
  accessToken: string;              // JWT access token (short-lived)
  accessTokenExpiresAt: string;      // ISO 8601 datetime, format: date-time
  refreshToken: string;              // JWT refresh token (long-lived)
  refreshTokenExpiresAt: string;     // ISO 8601 datetime, format: date-time
}
```

**Storage**: Persisted in browser localStorage as JSON
**Key Names in Storage**:
- `health_diary_access_token`
- `health_diary_refresh_token`
- `health_diary_access_token_expires_at`
- `health_diary_refresh_token_expires_at`

**Security Considerations**:
- Access token expires in minutes/hours (short-lived)
- Refresh token expires in days/weeks (long-lived)
- Both tokens stored in localStorage (acceptable for health diary use case)
- Tokens cleared on logout
- Token refresh occurs automatically on 401 Unauthorized response

**Validation Rules**:
- `accessToken`: Valid JWT format, contains exp claim
- `refreshToken`: Valid JWT format, contains exp claim
- `accessTokenExpiresAt` and `refreshTokenExpiresAt`: ISO 8601 datetime strings

---

### AuthState

Singleton service managing user authentication state.

```typescript
interface AuthState {
  isAuthenticated: boolean;         // True if access token exists and is valid
  currentUser: User | null;         // Current logged-in user, null if not authenticated
  lastRefreshTime: number;          // Timestamp of last token refresh (for debugging)
}
```

**State Transitions**:
1. **Initial**: `isAuthenticated: false, currentUser: null`
2. **After Login**: `isAuthenticated: true, currentUser: { id, email, username, name }`
3. **After Token Refresh**: `isAuthenticated: true, currentUser: same, lastRefreshTime: updated`
4. **After 401 + Refresh Fails**: `isAuthenticated: false, currentUser: null` (redirect to login)
5. **After Logout**: `isAuthenticated: false, currentUser: null`

**Usage in UI**:
- Guard authenticated pages (check `isAuthenticated` before rendering)
- Display user info in header/navbar
- Include access token in API request headers

---

## Health Record Models

All health records share common base properties.

### HealthRecord (Base)

```typescript
interface HealthRecord {
  id: string;                  // UUID format
  date: string;                // ISO 8601 date, format: date (yyyy-MM-dd)
  time: string;                // ISO 8601 time, format: time (HH:mm)
  recordType: string;          // Type discriminator: 'medication', 'hydration', 'bowel', 'food', 'observation'
  createdAt?: string;          // ISO 8601 datetime (optional, server-set)
  userId: string;              // UUID of the user who created the record (server-set)
}
```

**Validation Rules**:
- `date`: Must be valid yyyy-MM-dd format; past or present dates only
- `time`: Must be valid HH:mm format (24-hour)
- `recordType`: One of the five specific record types
- `id`: Always server-generated UUID

**Relationships**:
- Many-to-one with User
- Grouped by date in DailySummary
- Organized by recordType in DailySummary

---

### MedicationRecord

Health record for medication administration.

```typescript
interface MedicationRecord extends HealthRecord {
  recordType: 'medication';
  medication: string;               // Name of medication
  dosage: string;                   // Dosage amount and unit (e.g., "500mg", "2 tablets")
}
```

**Validation Rules** (OpenAPI schema):
- `medication`: Optional, can be null or empty string
- `dosage`: Optional, can be null or empty string
- `date` and `time`: Required (inherited)

**Frontend Validation**:
- `date` and `time` required (HTML5 required attribute)
- `medication` recommended (can display warning if empty but allow submission)
- `dosage` recommended (can display warning if empty but allow submission)

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-02-06",
  "time": "09:00",
  "recordType": "medication",
  "medication": "Metformin",
  "dosage": "500mg",
  "userId": "user-123",
  "createdAt": "2026-02-06T09:15:00Z"
}
```

---

### HydrationRecord

Health record for hydration/bottle consumption.

```typescript
interface HydrationRecord extends HealthRecord {
  recordType: 'hydration';
  quantity: number;                 // Amount consumed in ml or oz
}
```

**Validation Rules** (OpenAPI schema):
- `quantity`: Optional, number type
- `date` and `time`: Required (inherited)

**Frontend Validation**:
- `date` and `time` required
- `quantity` optional but when provided must be positive number
- Suggest units: ml or oz (store as-is without unit conversion)

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "date": "2026-02-06",
  "time": "10:30",
  "recordType": "hydration",
  "quantity": 250,
  "userId": "user-123"
}
```

---

### BowelRecord

Health record for bowel movement tracking.

```typescript
interface BowelRecord extends HealthRecord {
  recordType: 'bowel';
  consistency: 'Hard' | 'Normal' | 'Soft' | 'Diarrhea';   // Enum from OpenAPI
}
```

**Validation Rules** (OpenAPI schema):
- `consistency`: Required, must be one of exactly four values (case-sensitive: Hard, Normal, Soft, Diarrhea)
- `date` and `time`: Required

**Frontend Validation**:
- `date` and `time` required
- `consistency` required with dropdown/radio button selection showing all 4 options
- No free-text input; only enum values allowed

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "date": "2026-02-06",
  "time": "14:00",
  "recordType": "bowel",
  "consistency": "Normal",
  "userId": "user-123"
}
```

---

### FoodRecord

Health record for solid food consumption.

```typescript
interface FoodRecord extends HealthRecord {
  recordType: 'food';
  food: string;                     // Description of food consumed
  quantity: string;                 // Amount/portion size (e.g., "1 apple", "half cup")
}
```

**Validation Rules** (OpenAPI schema):
- `food`: Optional string
- `quantity`: Optional string
- `date` and `time`: Required

**Frontend Validation**:
- `date` and `time` required
- `food` optional but recommended
- `quantity` optional but recommended

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "date": "2026-02-06",
  "time": "12:30",
  "recordType": "food",
  "food": "Grilled chicken with rice",
  "quantity": "1 plate",
  "userId": "user-123"
}
```

---

### ObservationRecord

Health record for general notes and observations.

```typescript
interface ObservationRecord extends HealthRecord {
  recordType: 'observation';
  notes: string;                    // Free-form observation text
  category?: string;                // Optional category for grouping observations
}
```

**Validation Rules** (OpenAPI schema):
- `notes`: Optional string
- `category`: Optional string
- `date` and `time`: Required

**Frontend Validation**:
- `date` and `time` required
- `notes` optional but recommended
- `category` optional (provide text input or common suggestions like "Mood", "Sleep", "Energy", "Symptoms")

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "date": "2026-02-06",
  "time": "18:00",
  "recordType": "observation",
  "notes": "Feeling tired and experiencing mild headache",
  "category": "Symptoms",
  "userId": "user-123"
}
```

---

## Summary Models

### DailySummary

Collection of all health records for a specific date, organized by record type.

```typescript
interface DailySummary {
  date: string;                                    // ISO 8601 date, format: date (yyyy-MM-dd)
  data: HealthRecord[];                           // All records for the date (mixed types)
  // OR organized version:
  medications: MedicationRecord[];
  hydrations: HydrationRecord[];
  bowels: BowelRecord[];
  foods: FoodRecord[];
  observations: ObservationRecord[];
}
```

**OpenAPI Contract** (from GET /api/health/summary/{date}):
```json
{
  "date": "2026-02-06",
  "data": [
    { "id": "...", "date": "2026-02-06", "time": "09:00", "recordType": "medication", "medication": "...", "dosage": "..." },
    { "id": "...", "date": "2026-02-06", "time": "10:30", "recordType": "hydration", "quantity": 250 },
    ...
  ]
}
```

**Frontend Processing**:
When received from API, the frontend organizes the flat `data` array into typed arrays:
```javascript
function organizeDailySummary(apiResponse) {
  const organized = {
    date: apiResponse.date,
    medications: [],
    hydrations: [],
    bowels: [],
    foods: [],
    observations: []
  };
  
  apiResponse.data.forEach(record => {
    switch(record.recordType) {
      case 'medication': organized.medications.push(record); break;
      case 'hydration': organized.hydrations.push(record); break;
      case 'bowel': organized.bowels.push(record); break;
      case 'food': organized.foods.push(record); break;
      case 'observation': organized.observations.push(record); break;
    }
  });
  
  return organized;
}
```

**Display Rendering**:
- Render each record type section with appropriate field labels
- Show "No records" message if all arrays are empty
- Sort records within each type by time (optional, depends on API order)

---

## Error Models

### APIError

Standard error response from the API.

```typescript
interface APIError {
  statusCode: number;               // HTTP status code (400, 401, 409, 500, etc.)
  message: string;                  // User-friendly error message
  details?: any;                    // Optional additional details (depends on error type)
}
```

**Status Code Meanings**:

| Code | Meaning | Example | Frontend Action |
|------|---------|---------|-----------------|
| 400 | Bad Request / Validation Error | "Username is required" | Show form validation error, highlight field |
| 401 | Unauthorized | "Invalid credentials" or "Token expired" | If login page, show error; else attempt refresh, then redirect to login |
| 409 | Conflict | "Email already registered" | Show form validation error, suggest action (e.g., "login instead") |
| 500 | Server Error | "Internal server error" | Show generic message, suggest retry or contact support |

**Frontend Error Handling**:
- Centralized `errorHandler.js` maps status codes to user-friendly messages
- Implements retry logic for 500 errors
- Implements automatic refresh for 401 errors during health record operations
- Displays 400/409 errors inline in forms
- Displays other errors as dismissible toast notifications

---

## Type Definitions Summary

All TypeScript interfaces and validation rules are documented in:
- `src/api/types.ts` (frontend DTOs)
- `src/utils/validation.js` (validation rules)
- `src/services/errorHandler.js` (error type mappings)

---

## Validation Rules by Field

### Email
- **Type**: string
- **Format**: RFC 5322 email
- **Required**: Yes (for login, register)
- **Validation**: Regex pattern or native HTML5 `<input type="email">`
- **Error Message**: "Please enter a valid email address"

### Password
- **Type**: string
- **Requirements**: Minimum 8 characters
- **Required**: Yes (for login, register, reset)
- **Validation**: `password.length >= 8`
- **Error Message**: "Password must be at least 8 characters"

### Username
- **Type**: string
- **Length**: 3-50 characters
- **Pattern**: `^[a-zA-Z0-9_-]+$` (alphanumeric, hyphens, underscores only)
- **Required**: Yes (register only)
- **Validation**: Regex match
- **Error Message**: "Username must be 3-50 characters, containing only letters, numbers, hyphens, and underscores"

### Date
- **Type**: string (ISO 8601)
- **Format**: yyyy-MM-dd
- **Required**: Yes (all health records)
- **Validation**: Regex `^\d{4}-\d{2}-\d{2}$` or HTML5 `<input type="date">`
- **Error Message**: "Date is required"

### Time
- **Type**: string (ISO 8601)
- **Format**: HH:mm (24-hour)
- **Required**: Yes (all health records)
- **Validation**: Regex `^\d{2}:\d{2}$` or HTML5 `<input type="time">`
- **Error Message**: "Time is required"

### Quantity (Hydration)
- **Type**: number
- **Requirements**: Positive number
- **Required**: No
- **Validation**: `quantity > 0` if provided
- **Error Message**: "Quantity must be a positive number"

### Consistency (Bowel)
- **Type**: enum
- **Values**: Hard, Normal, Soft, Diarrhea (case-sensitive)
- **Required**: Yes
- **Validation**: `['Hard', 'Normal', 'Soft', 'Diarrhea'].includes(value)`
- **Error Message**: "Please select a consistency level"

### Invite Token
- **Type**: string (UUID)
- **Required**: Yes (register only)
- **Validation**: Server-side validation
- **Error Message**: "Invalid or expired invite link" (from server)

---

## Relationships

```
User
├── has many HealthRecord
│   ├── MedicationRecord
│   ├── HydrationRecord
│   ├── BowelRecord
│   ├── FoodRecord
│   └── ObservationRecord
└── has one current AuthTokens
    ├── accessToken (expires minutes/hours)
    └── refreshToken (expires days/weeks)

DailySummary
└── contains many HealthRecord (for a specific date)
```

---

## Notes

1. **Server-Generated Fields**: `id`, `userId`, and `createdAt` are always generated by the backend; frontend should not send these in POST requests.

2. **Optional vs Required**: The distinction between optional and required fields is documented, but the actual OpenAPI schema shows all health record creation endpoints accept optional `medication`, `dosage`, `quantity`, etc. The frontend treats these as recommended-but-not-required to provide a better UX (warning instead of blocking submission).

3. **Type Discriminator**: The `recordType` field serves as a discriminator for polymorphic health records. Frontend code uses this to determine how to display and process each record.

4. **Date Handling**: All dates are timezone-naive (no timezone information). Users' local timezone is assumed.

5. **Token Expiration**: Access tokens are short-lived (minutes to hours); refresh tokens are longer-lived (days to weeks). The frontend should check `isTokenExpired()` before making requests and proactively refresh if approaching expiration, or reactively refresh on 401 responses.

