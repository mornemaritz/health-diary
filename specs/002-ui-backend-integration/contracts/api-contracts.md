# API Contracts: UI-Backend Integration

**Date**: 2026-02-01  
**Feature**: UI-Backend API Integration  
**Purpose**: Document all API endpoint contracts with request/response examples

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user with email and password to obtain JWT tokens.

**Request**:
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Response (401 Unauthorized)**:
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

**Response (429 Too Many Requests)** - Rate limited:
```json
{
  "statusCode": 429,
  "message": "Too many login attempts. Please try again later."
}
```

**Response (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Email and password are required"
}
```

---

### POST /api/auth/refresh

Obtain a new access token using a valid refresh token.

**Request**:
```http
POST /api/auth/refresh HTTP/1.1
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Response (401 Unauthorized)** - Refresh token expired or invalid:
```json
{
  "statusCode": 401,
  "message": "Refresh token invalid or expired. Please log in again."
}
```

---

## Health Record Endpoints

### POST /api/health/medication

Create a medication administration record.

**Request**:
```http
POST /api/health/medication HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "medication": "Aspirin",
  "dosage": "100mg",
  "schedule": "SevenAm",
  "date": "2026-02-01",
  "time": "07:00:00"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Medication record created successfully."
}
```

**Response (400 Bad Request)** - Missing required fields:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required."
}
```

**Response (409 Conflict)** - Duplicate record:
```json
{
  "statusCode": 409,
  "message": "A medication record already exists for Aspirin at this date and time."
}
```

**Response (401 Unauthorized)** - Token expired:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### POST /api/health/bottle

Create a hydration (bottle consumption) record.

**Request**:
```http
POST /api/health/bottle HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bottleSize": 500,
  "date": "2026-02-01",
  "time": "08:30:00"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Bottle consumption record created successfully."
}
```

**Response (409 Conflict)** - Duplicate at same date/time:
```json
{
  "statusCode": 409,
  "message": "A bottle consumption record already exists for this date and time."
}
```

---

### POST /api/health/bowel-movement

Create a bowel movement record.

**Request**:
```http
POST /api/health/bowel-movement HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "size": "medium",
  "consistency": "normal",
  "color": "brown",
  "date": "2026-02-01",
  "time": "09:00:00"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "message": "Bowel movement record created successfully."
}
```

---

### POST /api/health/solid-food

Create a food intake record.

**Request**:
```http
POST /api/health/solid-food HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "foodDescription": "oatmeal with berries",
  "notes": "felt good after eating",
  "date": "2026-02-01",
  "time": "09:30:00"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "message": "Food intake record created successfully."
}
```

---

### POST /api/health/note

Create an observation/note record.

**Request**:
```http
POST /api/health/note HTTP/1.1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "observation": "Felt more energetic today than usual",
  "date": "2026-02-01",
  "time": "20:00:00"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "message": "Observation record created successfully."
}
```

---

## Data Retrieval Endpoints

### GET /api/health/summary/{date}

Retrieve a summary of all health records for a specific date.

**Request**:
```http
GET /api/health/summary/2026-02-01 HTTP/1.1
Authorization: Bearer <accessToken>
```

**Response (200 OK)**:
```json
{
  "date": "2026-02-01",
  "totalMedications": 2,
  "totalBottles": 3,
  "totalBowelMovements": 1,
  "totalFoodIntakes": 2,
  "totalNotes": 1,
  "allRecords": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2026-02-01",
      "time": "07:00:00",
      "recordType": "Medication",
      "summary": "Aspirin - 100mg (SevenAm)"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "date": "2026-02-01",
      "time": "08:30:00",
      "recordType": "Bottle",
      "summary": "Hydration: 500ml"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "date": "2026-02-01",
      "time": "09:00:00",
      "recordType": "BowelMovement",
      "summary": "Bowel movement: medium, normal, brown"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "date": "2026-02-01",
      "time": "09:30:00",
      "recordType": "SolidFood",
      "summary": "Food: oatmeal with berries"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "date": "2026-02-01",
      "time": "20:00:00",
      "recordType": "Observation",
      "summary": "Felt more energetic today than usual"
    }
  ]
}
```

**Response (400 Bad Request)** - Invalid date format:
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use yyyy-MM-dd."
}
```

**Response (200 OK)** - Empty day (no records):
```json
{
  "date": "2026-02-01",
  "totalMedications": 0,
  "totalBottles": 0,
  "totalBowelMovements": 0,
  "totalFoodIntakes": 0,
  "totalNotes": 0,
  "allRecords": []
}
```

---

### GET /api/health/medications/dosage-groups

Retrieve all available medication dosage groups.

**Request**:
```http
GET /api/health/medications/dosage-groups HTTP/1.1
Authorization: Bearer <accessToken>
```

**Response (200 OK)**:
```json
[
  {
    "medication": "Epilim",
    "dosage": "4ml",
    "schedule": "SevenAm"
  },
  {
    "medication": "Gabapentin",
    "dosage": "300mg",
    "schedule": "SevenAm"
  },
  {
    "medication": "Risperidone",
    "dosage": "1mg",
    "schedule": "SevenAm"
  },
  {
    "medication": "Nexium",
    "dosage": "20mg",
    "schedule": "SevenAm"
  },
  {
    "medication": "Menograine",
    "dosage": "4 tablets",
    "schedule": "SevenPm"
  }
]
```

---

### GET /api/health/medications/dosage-groups/schedule/{schedule}

Retrieve medication dosage groups for a specific schedule.

**Request**:
```http
GET /api/health/medications/dosage-groups/schedule/SevenAm HTTP/1.1
Authorization: Bearer <accessToken>
```

**Response (200 OK)**:
```json
[
  {
    "medication": "Epilim",
    "dosage": "4ml",
    "schedule": "SevenAm"
  },
  {
    "medication": "Gabapentin",
    "dosage": "300mg",
    "schedule": "SevenAm"
  },
  {
    "medication": "Risperidone",
    "dosage": "1mg",
    "schedule": "SevenAm"
  }
]
```

**Response (400 Bad Request)** - Invalid schedule:
```json
{
  "statusCode": 400,
  "message": "Invalid schedule. Valid values are: SevenAm, ThreePm, SevenPm, TenPm, AdHoc"
}
```

---

## Error Handling

All endpoints follow standard HTTP status codes:

| Status | Scenario | Example Message |
|--------|----------|-----------------|
| 200 | Success (GET) | - |
| 201 | Created (POST) | "Medication record created successfully." |
| 400 | Bad Request | "Date and Time are required." |
| 401 | Unauthorized (token missing/expired) | "Unauthorized" |
| 409 | Conflict (duplicate record) | "A medication record already exists..." |
| 429 | Rate Limited | "Too many login attempts. Please try again later." |
| 500 | Server Error | "Internal server error" |

---

## Authentication Header Format

All protected endpoints require:

```
Authorization: Bearer <accessToken>
```

**Example**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## CORS Requirements

Backend CORS configuration must allow:
- **Origin**: UI domain (e.g., http://localhost:5173 for dev, https://health-diary.app for prod)
- **Methods**: GET, POST, OPTIONS
- **Headers**: Content-Type, Authorization
- **Credentials**: Include (for cookie-based auth if used)

---

## Rate Limiting

Login endpoint is rate-limited to prevent brute force:

**Limit**: 5 attempts per minute per IP address

**Response when limited (429)**:
```json
{
  "statusCode": 429,
  "message": "Too many login attempts. Please try again later."
}
```

---

## Response Content-Type

All responses use:
```
Content-Type: application/json; charset=utf-8
```

---

## Date/Time Format Standards

- **Date**: `yyyy-MM-dd` (ISO 8601)
- **Time**: `HH:mm:ss` (24-hour format)
- **Timezone**: Local date/time (no conversion)

---

## Notes for Frontend Developers

1. **Always include** `Authorization: Bearer <token>` header for protected endpoints
2. **Token refresh**: Automatically refresh access token before expiry or on 401 response
3. **Error handling**: Map error messages to user-friendly messages; show validation details from `details` array
4. **Retry logic**: Auto-retry 5xx errors with exponential backoff; manual retry for 4xx
5. **Duplicate records**: 409 Conflict response indicates duplicate; show user a clear message
6. **Date/Time**: Always format as `yyyy-MM-dd` and `HH:mm:ss` when sending to backend
7. **CORS**: Ensure backend CORS allows your UI domain
