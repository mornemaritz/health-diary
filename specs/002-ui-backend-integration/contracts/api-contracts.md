# API Contracts: Frontend-Backend API Integration

**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)
**Date**: 2026-02-08
**Source**: openapi.yaml (OpenAPI 3.0.0 specification)

## API Endpoint Overview

The backend API defines 11 endpoints across two operation categories:

### Authentication Endpoints

| Method | Path | Purpose | Auth | Request | Response |
|--------|------|---------|------|---------|----------|
| POST | /api/auth/register | Register new user | None | RegisterRequest | RegisterResponse (201) |
| POST | /api/auth/login | Authenticate user | None | LoginRequest | LoginResponse (200) |
| POST | /api/auth/token/refresh | Refresh access token | None | RefreshTokenRequest | RefreshTokenResponse (200) |
| POST | /api/auth/admin/invite | Generate invite link | Bearer | GenerateInviteRequest | GenerateInviteResponse (201) |
| GET | /api/auth/invite/validate | Validate invite link | None | query: token | { message: string } (200) |
| POST | /api/auth/admin/password-reset | Request password reset | Bearer | query: userId | PasswordResetLinkResponse (200) |
| POST | /api/auth/password-reset/confirm | Reset password | None | ResetPasswordRequest | { message: string } (200) |

### Health Record Endpoints

| Method | Path | Purpose | Auth | Request | Response |
|--------|------|---------|------|---------|----------|
| POST | /api/health/medication | Create medication record | Bearer | MedicationAdministration | { id: uuid, message: string } (201) |
| POST | /api/health/bottle | Create hydration record | Bearer | BottleConsumption | { id: uuid, message: string } (201) |
| POST | /api/health/bowel-movement | Create bowel movement record | Bearer | BowelMovement | { id: uuid, message: string } (201) |
| POST | /api/health/solid-food | Create food record | Bearer | SolidFoodConsumption | { id: uuid, message: string } (201) |
| POST | /api/health/note | Create observation record | Bearer | Observation | { id: uuid, message: string } (201) |
| GET | /api/health/summary/{date} | Get daily summary | Bearer | path: date (yyyy-MM-dd) | DailySummary (200) |

## Frontend Integration Scope

**In Scope** (required for this feature):
- /api/auth/register (user registration)
- /api/auth/login (user authentication)
- /api/auth/token/refresh (token management)
- /api/auth/invite/validate (validate invite link before register)
- /api/health/medication (create medication record)
- /api/health/bottle (create hydration record)
- /api/health/bowel-movement (create bowel movement record)
- /api/health/solid-food (create food record)
- /api/health/note (create observation record)
- /api/health/summary/{date} (view daily summary)

**Out of Scope** (backend admin functionality, not integrated into UI):
- /api/auth/admin/invite (generates invites; admin-only)
- /api/auth/admin/password-reset (admin initiates password reset)
- /api/auth/password-reset/confirm (password reset flows not in UI scope)

## Request/Response Schemas (Generated from OpenAPI)

### Authentication Requests

**RegisterRequest**:
```typescript
{
  inviteToken: string;      // Required: Unique invite token
  email: string;            // Required: Email address
  username: string;         // Required: 3-50 chars, pattern ^[a-zA-Z0-9_-]+$
  name: string;             // Required: Full name
  password: string;         // Required: Min 8 characters
}
```

**LoginRequest**:
```typescript
{
  email: string;            // Required: Email address
  password: string;         // Required: Password
}
```

**RefreshTokenRequest**:
```typescript
{
  refreshToken: string;     // Required: Refresh token from login response
}
```

### Authentication Responses

**RegisterResponse**:
```typescript
{
  id: string;               // UUID of new user
  email: string;            // Email address
  message: string;          // Status message
}
```

**LoginResponse**:
```typescript
{
  accessToken: string;                    // JWT access token
  accessTokenExpiresAt: string;          // ISO 8601 datetime
  refreshToken: string;                  // JWT refresh token
  refreshTokenExpiresAt: string;         // ISO 8601 datetime
  message: string;                        // Status message
}
```

**RefreshTokenResponse**:
```typescript
{
  accessToken: string;      // New JWT access token
  expiresAt: string;        // ISO 8601 datetime when token expires
  message: string;          // Status message
}
```

### Health Record Requests

**MedicationAdministration**:
```typescript
{
  date: string;             // Required: yyyy-MM-dd format
  time: string;             // Required: HH:mm format
  medication?: string;      // Optional: Medication name
  dosage?: string;          // Optional: Dosage amount
}
```

**BottleConsumption** (hydration):
```typescript
{
  date: string;             // Required: yyyy-MM-dd format
  time: string;             // Required: HH:mm format
  quantity?: number;        // Optional: Amount in ml or oz
}
```

**BowelMovement**:
```typescript
{
  date: string;             // Required: yyyy-MM-dd format
  time: string;             // Required: HH:mm format
  consistency?: string;     // Optional: "Hard" | "Normal" | "Soft" | "Diarrhea"
}
```

**SolidFoodConsumption**:
```typescript
{
  date: string;             // Required: yyyy-MM-dd format
  time: string;             // Required: HH:mm format
  food?: string;            // Optional: Food description
  quantity?: string;        // Optional: Amount consumed
}
```

**Observation** (note):
```typescript
{
  date: string;             // Required: yyyy-MM-dd format
  time: string;             // Required: HH:mm format
  notes?: string;           // Optional: Observation text
  category?: string;        // Optional: Category
}
```

### Health Record Responses

**CreateHealthRecordResponse**:
```typescript
{
  id: string;               // UUID of created record
  message: string;          // Status message
}
```

**DailySummary**:
```typescript
{
  date: string;             // yyyy-MM-dd
  data: [
    {
      id: string;           // UUID
      date: string;         // yyyy-MM-dd
      time: string;         // HH:mm
      recordType: string;   // "medication" | "hydration" | "bowel-movement" | "food" | "observation"
      summary: string;      // Human-readable summary
      // ... type-specific fields
    },
    // ... more records
  ]
}
```

## Error Response Format

**All Error Responses** (4xx, 5xx):
```typescript
{
  statusCode: number;       // HTTP status code (400, 401, 409, etc.)
  message: string;          // Human-readable error message
  details?: object;         // Optional: Additional error details
}
```

**Common Error Status Codes**:

| Code | Scenario | Message Example |
|------|----------|-----------------|
| 400 | Validation failed | "Date and Time are required" |
| 400 | Invalid invite token | "Invalid or expired invite link" |
| 400 | Invalid password reset token | "Invalid reset token or password validation failed" |
| 401 | Missing/invalid JWT token | "Unauthorized - Valid access token required" |
| 401 | Invalid credentials | "Invalid credentials or rate limit exceeded" |
| 409 | Record creation conflict | "Conflict - Record could not be created" |

## HTTP Headers & Authentication

### Request Headers

**All Authenticated Requests** (health records, token refresh):
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Unauthenticated Requests** (login, register):
```
Content-Type: application/json
```

### Response Headers

All responses include standard HTTP headers. No custom headers required by frontend.

## Rate Limiting & Retry Logic

**Rate Limiting** (from OpenAPI description):
- Applied to /api/auth/login
- Prevents brute force attacks
- Returns 401 if rate limit exceeded: "Invalid credentials or rate limit exceeded"
- Implementation: Exponential backoff recommended in frontend (first retry after 1s, then 2s, 4s, etc.)

**Retry Strategy**:
- Automatic retry on 5xx (server error) with exponential backoff
- Automatic refresh + retry on 401 (token expired)
- No retry on 4xx except 401

## Contract Testing

Frontend contract tests verify:
1. ✅ Correct request format matches OpenAPI schema
2. ✅ Response parsing handles all expected fields
3. ✅ Error responses are parsed correctly
4. ✅ Token handling works (stored, sent in headers, refreshed)
5. ✅ Date/time formats are correct (yyyy-MM-dd, HH:mm)

**Tools**: Vitest with mocked responses matching OpenAPI examples

## OpenAPI Generation

**TypeScript Type Generation**:
```bash
npm run generate:types  # Generates src/types/api.ts from openapi.yaml
```

Generated types ensure type-safe API calls and prevent schema drift.
