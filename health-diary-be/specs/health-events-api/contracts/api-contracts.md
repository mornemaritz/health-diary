# Health Events API Contracts

## Overview
This document defines the API contracts for the Health Diary REST API, including request/response formats, status codes, and error handling.

## Base URL
```
https://api.healthdiary.local/api/health
```

## Authentication
TBD (Not implemented in Phase 1)

## Endpoints

### 1. POST /medication
Create a medication record for a specific date.

**Request Body:**
```json
{
  "medication": "Aspirin",
  "dosage": "100mg",
  "schedule": "7am",
  "date": "2025-11-09",
  "time": "07:00:00"
}
```

**Schedule Values:** `7am`, `3pm`, `7pm`, `10pm`, `adhoc`

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Medication record created successfully."
}
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Date and Time are required."
}
```

**Response (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "A medication record already exists for this date and time."
}
```

---

### 2. POST /bottle
Create a hydration/bottle record.

**Request Body:**
```json
{
  "bottleSize": 250,
  "date": "2025-11-09",
  "time": "08:00:00"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Bottle record created successfully."
}
```

---

### 3. POST /bowel-movement
Create a bowel movement record.

**Request Body:**
```json
{
  "size": "large",
  "consistency": "normal",
  "color": "brown",
  "date": "2025-11-09",
  "time": "09:00:00"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "message": "Bowel movement record created successfully."
}
```

---

### 4. POST /solid-food
Create a solid food intake record.

**Request Body:**
```json
{
  "item": "Oatmeal",
  "size": "small",
  "notes": "With berries",
  "date": "2025-11-09",
  "time": "08:30:00"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "message": "Solid food record created successfully."
}
```

---

### 5. POST /note
Create a note/observation record.

**Request Body:**
```json
{
  "note": "Feeling great today!",
  "date": "2025-11-09",
  "time": "10:00:00"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "message": "Note record created successfully."
}
```

---

### 6. GET /records/{date}
Retrieve all records for a specific date.

**Parameters:**
- `date` (path, required): Date in `yyyy-MM-dd` format

**Response (200 OK):**
```json
{
  "date": "2025-11-09",
  "totalMedications": 2,
  "totalBottles": 3,
  "totalBowelMovements": 1,
  "totalFoodIntakes": 2,
  "totalNotes": 1,
  "allRecords": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2025-11-09",
      "time": "07:00:00",
      "recordType": "Medication"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "date": "2025-11-09",
      "time": "08:00:00",
      "recordType": "Bottle"
    }
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use yyyy-MM-dd."
}
```

---

### 7. GET /summary/{date}
Retrieve a summary of all records for a specific date (same as `/records/{date}`).

**Parameters:**
- `date` (path, required): Date in `yyyy-MM-dd` format

**Response (200 OK):**
```json
{
  "date": "2025-11-09",
  "totalMedications": 2,
  "totalBottles": 3,
  "totalBowelMovements": 1,
  "totalFoodIntakes": 2,
  "totalNotes": 1,
  "allRecords": [...]
}
```

---

## Error Handling

### Status Codes
- **200 OK:** Successful GET request
- **201 Created:** Successful POST request
- **400 Bad Request:** Invalid input (missing fields, invalid date format)
- **409 Conflict:** Duplicate record exists
- **500 Internal Server Error:** Server-side error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "details": ["Additional detail 1", "Additional detail 2"]
}
```

---

## Date/Time Format
- **Date:** ISO 8601 format: `yyyy-MM-dd` (e.g., `2025-11-09`)
- **Time:** ISO 8601 format: `HH:mm:ss` (e.g., `07:00:00`)

---

## Performance Requirements
- All endpoints target <200ms p95 response time
- Support concurrent requests for 10k+ users
- Index on `Date` for efficient querying
