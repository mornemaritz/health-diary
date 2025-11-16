# Health Events API - Quickstart Guide

## Overview
The Health Diary REST API tracks daily healthcare events and actions, grouping them by date. It supports medication administration, hydration tracking, bowel movements, solid food intake, and general notes.

## Prerequisites
- .NET 8 SDK installed
- PostgreSQL 14+ running
- Docker (optional, for PostgreSQL)

## Quick Setup

### 1. Start PostgreSQL (if using Docker)
```bash
docker run --name postgres-health-diary \
  -e POSTGRES_PASSWORD=env.HD_POSTGRES_PASSWORD \
  -e POSTGRES_DB=health_diary \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Update Database Connection (optional)
Edit `user-secrets` to set your PostgreSQL connection in the following format (with credentials supplied of course):
```json
{
 "ConnectionStrings:DefaultConnection": "Host=localhost;Port=5432;Database=health_diary;Username=;Password="
}
```

### 3. Run Database Migrations
```bash
cd src
dotnet ef database update
```

### 4. Build and Run the API
```bash
cd src
dotnet run
```

The API will be available at `https://localhost:5001` or `http://localhost:5000`.

## Example API Calls

### Add a Medication Record
```bash
curl -X POST http://localhost:5000/api/health/medication \
  -H "Content-Type: application/json" \
  -d '{
    "medication": "Aspirin",
    "dosage": "100mg",
    "schedule": "7am",
    "date": "2025-11-09",
    "time": "07:00:00"
  }'
```

### Add a Hydration Record
```bash
curl -X POST http://localhost:5000/api/health/bottle \
  -H "Content-Type: application/json" \
  -d '{
    "bottleSize": 250,
    "date": "2025-11-09",
    "time": "08:00:00"
  }'
```

### Add a Note
```bash
curl -X POST http://localhost:5000/api/health/note \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Feeling great today!",
    "date": "2025-11-09",
    "time": "10:00:00"
  }'
```

### Get Daily Summary
```bash
curl http://localhost:5000/api/health/summary/2025-11-09
```

### Get All Records for a Date
```bash
curl http://localhost:5000/api/health/records/2025-11-09
```

## Running Tests

### Unit Tests
```bash
cd tests
dotnet test
```

### Run with Code Coverage (requires additional setup)
```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura
```

## Project Structure
```
src/
├── Models/              # Entity and DTO models
├── Data/                # EF Core DbContext
├── Services/            # Business logic
├── Migrations/          # Database migrations
├── Program.cs           # Minimal API setup
├── appsettings.json     # Configuration
└── *.csproj             # Project file

tests/
├── Unit/                # Unit tests
└── Integration/         # Integration tests (future)
```

## API Response Examples

### Success Response (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Medication record created successfully."
}
```

### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Date and Time are required."
}
```

### Error Response (409 Conflict)
```json
{
  "statusCode": 409,
  "message": "A medication record already exists for this date and time."
}
```

### Summary Response (200 OK)
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
    }
  ]
}
```

## Environment Variables (optional)
```bash
export ASPNETCORE_ENVIRONMENT=Development
export ASPNETCORE_URLS=http://localhost:5000
```

## Documentation
- Full API Contracts: `specs/health-events-api/contracts/api-contracts.md`
- Implementation Plan: `specs/health-events-api/plan.md`
- Feature Specification: `specs/health-events-api/spec.md`
