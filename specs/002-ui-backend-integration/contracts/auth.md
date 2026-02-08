# API Contracts: Authentication Endpoints

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Source**: OpenAPI 3.0.0 (health-diary-be/openapi.yaml)

## Overview

Authentication endpoints for user registration, login, and token management. All authentication tokens are JWT format with expiration times. Access tokens are short-lived; refresh tokens are longer-lived.

---

## POST /api/auth/register

Register a new user using a valid invite token.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body Schema**:
```typescript
interface RegisterRequest {
  inviteToken: string;   // Required: UUID invite token from registration link
  email: string;         // Required: Email address, format: email
  username: string;      // Required: 3-50 chars, pattern: ^[a-zA-Z0-9_-]+$
  name: string;          // Required: User's full name
  password: string;      // Required: Minimum 8 characters
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "inviteToken": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "user_123",
    "name": "John Doe",
    "password": "SecurePassword123"
  }'
```

### Response

**Success (201 Created)**:
```typescript
interface RegisterResponse {
  id: string;            // User ID (UUID)
  email: string;         // Registered email
  message: string;       // "User successfully registered" or similar
}
```

**Example (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "message": "User successfully registered"
}
```

**Error (400 Bad Request)** - Validation failed:
```typescript
interface Error {
  statusCode: number;    // 400
  message: string;       // Validation error message
  details?: object;      // Optional field-level errors
}
```

**Examples (400)**:
```json
{
  "statusCode": 400,
  "message": "Email is required"
}
```
```json
{
  "statusCode": 400,
  "message": "Password must be at least 8 characters"
}
```
```json
{
  "statusCode": 400,
  "message": "Username must be 3-50 characters and contain only alphanumeric characters, hyphens, and underscores"
}
```

**Error (409 Conflict)** - Username or email already exists:
```json
{
  "statusCode": 409,
  "message": "Username already exists. Please choose a different username."
}
```
```json
{
  "statusCode": 409,
  "message": "Email is already registered. Please log in instead."
}
```

**Error (400 Bad Request)** - Invalid invite token:
```json
{
  "statusCode": 400,
  "message": "Invalid or expired invite link. Please request a new invite."
}
```

### Frontend Implementation Notes

- Validate input client-side before submission (FR-024)
- On 400 error, display field-specific messages in form
- On 409 conflict error, suggest alternative action (e.g., "Login instead?")
- On success, redirect to login page
- Store invite token from URL query parameter (e.g., `?token=...`)

---

## POST /api/auth/login

Authenticate user with email and password, returning access and refresh tokens.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body Schema**:
```typescript
interface LoginRequest {
  email: string;         // Required: Registered email address
  password: string;      // Required: User's password
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Response

**Success (200 OK)**:
```typescript
interface LoginResponse {
  accessToken: string;              // JWT token for authenticated requests
  accessTokenExpiresAt: string;      // ISO 8601 datetime when access token expires
  refreshToken: string;              // JWT token for obtaining new access token
  refreshTokenExpiresAt: string;     // ISO 8601 datetime when refresh token expires
  message: string;                  // "Successfully authenticated" or similar
}
```

**Example (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresAt": "2026-02-06T13:00:00Z",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshTokenExpiresAt": "2026-02-13T12:00:00Z",
  "message": "Successfully authenticated"
}
```

**Error (401 Unauthorized)** - Invalid credentials:
```json
{
  "statusCode": 401,
  "message": "Invalid email or password. Please try again."
}
```

**Error (401 Unauthorized)** - Rate limit exceeded:
```json
{
  "statusCode": 401,
  "message": "Too many login attempts. Please try again later."
}
```

### Frontend Implementation Notes

- Validate email and password client-side (FR-024)
- On success, store tokens in localStorage (FR-019):
  - `health_diary_access_token` = accessToken
  - `health_diary_refresh_token` = refreshToken
  - `health_diary_access_token_expires_at` = accessTokenExpiresAt
  - `health_diary_refresh_token_expires_at` = refreshTokenExpiresAt
- Update authState.isAuthenticated = true (FR-019)
- Redirect to home/summary page
- On 401 error, display error message and allow retry (FR-022)
- Include access token in Authorization header for subsequent requests (FR-020)

---

## POST /api/auth/token/refresh

Refresh an expired access token using a valid refresh token.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body Schema**:
```typescript
interface RefreshTokenRequest {
  refreshToken: string;  // Required: Valid refresh token from previous login
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Response

**Success (200 OK)**:
```typescript
interface RefreshTokenResponse {
  accessToken: string;              // New JWT access token
  expiresAt: string;                // ISO 8601 datetime when new access token expires
  message: string;                  // "Token refreshed" or similar
}
```

**Example (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-02-06T13:30:00Z",
  "message": "Token refreshed"
}
```

**Error (401 Unauthorized)** - Invalid or expired refresh token:
```json
{
  "statusCode": 401,
  "message": "Refresh token is invalid or expired. Please log in again."
}
```

### Frontend Implementation Notes

- Called automatically when receiving 401 Unauthorized during API requests (FR-003, FR-021)
- Transparent to user (no UX interruption during successful refresh) per SC-005
- On success, update localStorage and retry the original request (FR-021)
- On failure (401), clear tokens and redirect to login page
- Prevent infinite refresh loops (max 1-2 refresh attempts per request)

### Token Refresh Flow

```
1. API request made with access token
2. Receive 401 Unauthorized
3. Check if refresh token exists and is valid
4. POST /api/auth/token/refresh with refresh token
5a. Success: Update access token, retry original request
5b. Failure: Clear tokens, redirect to login
```

---

## Authentication Headers

### Authorization Header

All authenticated API requests must include the Authorization header with the access token:

```
Authorization: Bearer {accessToken}
```

**Example**:
```bash
curl -X GET http://localhost:5000/api/health/summary/2026-02-06 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JWT Structure

Both access and refresh tokens are JWT format with three parts: header.payload.signature

**Payload contains**:
- `exp`: Token expiration time (Unix timestamp)
- `sub`: Subject (user ID)
- `email`: User email (optional)
- `username`: Username (optional)
- Other claims as defined by backend

**Frontend token validation**:
```javascript
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
}
```

---

## Summary

| Endpoint | Method | Purpose | Auth | Request Body | Response |
|----------|--------|---------|------|--------------|----------|
| /api/auth/register | POST | Create new user account | None | email, username, name, password, inviteToken | { id, email, message } |
| /api/auth/login | POST | Authenticate and get tokens | None | email, password | { accessToken, refreshToken, expiresAt } |
| /api/auth/token/refresh | POST | Get new access token | None | refreshToken | { accessToken, expiresAt } |

**Error Codes**:
- 400: Validation failed (missing/invalid fields)
- 401: Authentication failed (invalid credentials, expired token, rate limited)
- 409: Conflict (username/email already exists)
- 500: Server error (rare)

