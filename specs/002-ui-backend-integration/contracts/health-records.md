# API Contracts: Health Record Endpoints

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Source**: OpenAPI 3.0.0 (health-diary-be/openapi.yaml)

## Overview

Five POST endpoints for creating different types of health records. All endpoints require JWT authentication via the Authorization header. Each returns the created record ID and a success message.

---

## POST /api/health/medication

Create a medication administration record.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Body Schema**:
```typescript
interface MedicationAdministrationRequest {
  date: string;         // Required: ISO 8601 date (yyyy-MM-dd)
  time: string;         // Required: ISO 8601 time (HH:mm)
  medication?: string;  // Optional: Name of medication
  dosage?: string;      // Optional: Dosage amount and unit
}
```

**Validation Rules**:
- `date` and `time` are required
- `medication` and `dosage` are optional but recommended

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/health/medication \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "date": "2026-02-06",
    "time": "09:00",
    "medication": "Metformin",
    "dosage": "500mg"
  }'
```

### Response

**Success (201 Created)**:
```typescript
interface HealthRecordResponse {
  id: string;           // UUID of created record
  message: string;      // "Medication record created successfully" or similar
}
```

**Example (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Medication record created successfully"
}
```

**Error (400 Bad Request)** - Missing required fields:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

**Error (401 Unauthorized)** - Missing or invalid auth token:
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Valid access token required"
}
```

**Error (409 Conflict)** - Record could not be created:
```json
{
  "statusCode": 409,
  "message": "Conflict - Record could not be created"
}
```

---

## POST /api/health/bottle

Create a hydration/bottle consumption record.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Body Schema**:
```typescript
interface BottleConsumptionRequest {
  date: string;         // Required: ISO 8601 date (yyyy-MM-dd)
  time: string;         // Required: ISO 8601 time (HH:mm)
  quantity?: number;    // Optional: Amount consumed in ml or oz
}
```

**Validation Rules**:
- `date` and `time` are required
- `quantity` is optional but should be positive number if provided

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/health/bottle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "date": "2026-02-06",
    "time": "10:30",
    "quantity": 250
  }'
```

### Response

**Success (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "message": "Bottle record created successfully"
}
```

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

---

## POST /api/health/bowel-movement

Create a bowel movement record.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Body Schema**:
```typescript
interface BowelMovementRequest {
  date: string;                                      // Required: ISO 8601 date (yyyy-MM-dd)
  time: string;                                      // Required: ISO 8601 time (HH:mm)
  consistency?: 'Hard' | 'Normal' | 'Soft' | 'Diarrhea';  // Optional: Consistency enum
}
```

**Validation Rules**:
- `date` and `time` are required
- `consistency` is optional but must be one of four values if provided
- Values are case-sensitive: Hard, Normal, Soft, Diarrhea

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/health/bowel-movement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "date": "2026-02-06",
    "time": "14:00",
    "consistency": "Normal"
  }'
```

### Response

**Success (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "message": "Bowel movement record created successfully"
}
```

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

---

## POST /api/health/solid-food

Create a solid food consumption record.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Body Schema**:
```typescript
interface SolidFoodConsumptionRequest {
  date: string;         // Required: ISO 8601 date (yyyy-MM-dd)
  time: string;         // Required: ISO 8601 time (HH:mm)
  food?: string;        // Optional: Description of food consumed
  quantity?: string;    // Optional: Amount/portion size
}
```

**Validation Rules**:
- `date` and `time` are required
- `food` and `quantity` are optional but recommended

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/health/solid-food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "date": "2026-02-06",
    "time": "12:30",
    "food": "Grilled chicken with rice",
    "quantity": "1 plate"
  }'
```

### Response

**Success (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "message": "Solid food record created successfully"
}
```

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

---

## POST /api/health/note

Create an observation/note record.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Body Schema**:
```typescript
interface ObservationRequest {
  date: string;         // Required: ISO 8601 date (yyyy-MM-dd)
  time: string;         // Required: ISO 8601 time (HH:mm)
  notes?: string;       // Optional: Free-form observation text
  category?: string;    // Optional: Category for grouping
}
```

**Validation Rules**:
- `date` and `time` are required
- `notes` and `category` are optional

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/health/note \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "date": "2026-02-06",
    "time": "18:00",
    "notes": "Feeling tired and experiencing mild headache",
    "category": "Symptoms"
  }'
```

### Response

**Success (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "message": "Note record created successfully"
}
```

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

---

## Common Response Patterns

### Success Response (201 Created)

All health record endpoints return the same success format:

```typescript
{
  id: string;           // UUID of the newly created record
  message: string;      // Confirmation message
}
```

### Error Responses

**400 Bad Request** - Validation failed (missing date/time):
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

**401 Unauthorized** - Authentication failed:
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Valid access token required"
}
```

**409 Conflict** - Record could not be created:
```json
{
  "statusCode": 409,
  "message": "Conflict - Record could not be created"
}
```

---

## Frontend Implementation Notes

### Form Validation (FR-024)

Before submitting to any endpoint, validate client-side:

```javascript
// Required fields for all types
const errors = [];
if (!date) errors.push("Date is required");
if (!time) errors.push("Time is required");

// Type-specific validation
switch(recordType) {
  case 'bowel':
    if (!consistency) errors.push("Consistency level is required");
    if (!['Hard', 'Normal', 'Soft', 'Diarrhea'].includes(consistency)) {
      errors.push("Invalid consistency level");
    }
    break;
  case 'hydration':
    if (quantity && quantity <= 0) errors.push("Quantity must be positive");
    break;
}

if (errors.length > 0) {
  // Display field-specific error messages
  displayFormErrors(errors);
  return; // Don't submit
}
```

### Authorization Header (FR-020)

Always include the access token:

```javascript
const response = await fetch('/api/health/medication', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`
  },
  body: JSON.stringify(payload)
});
```

### Error Handling (FR-021, FR-022)

```javascript
if (response.status === 401) {
  // Attempt token refresh
  const newToken = await refreshAccessToken();
  if (newToken) {
    // Retry with new token
    return retryRequest(newToken);
  } else {
    // Redirect to login
    window.location.hash = '#/login';
  }
}

if (response.status === 400 || response.status === 409) {
  const error = await response.json();
  // Display inline form error
  displayFieldError(error.message);
}
```

### Success Display (FR-022)

```javascript
if (response.status === 201) {
  const result = await response.json();
  // Show success message
  displaySuccessMessage(`Record saved successfully (ID: ${result.id})`);
  // Clear form and refresh summary
  clearForm();
  await refreshDailySummary();
}
```

---

## Summary Table

| Endpoint | Method | Purpose | Required Fields | Optional Fields | Auth |
|----------|--------|---------|-----------------|-----------------|------|
| /api/health/medication | POST | Record medication | date, time | medication, dosage | Yes |
| /api/health/bottle | POST | Record hydration | date, time | quantity | Yes |
| /api/health/bowel-movement | POST | Record bowel | date, time | consistency | Yes |
| /api/health/solid-food | POST | Record food | date, time | food, quantity | Yes |
| /api/health/note | POST | Record observation | date, time | notes, category | Yes |

**Response**: All return 201 with { id, message } on success

**Common Errors**:
- 400: Date and Time are required
- 401: Invalid access token
- 409: Record could not be created

