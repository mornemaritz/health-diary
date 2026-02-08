# API Contracts: Error Response Format

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Source**: OpenAPI 3.0.0 (health-diary-be/openapi.yaml)

## Overview

All API error responses follow a consistent format. The frontend centralizes error handling to map HTTP status codes and API messages to user-friendly display messages.

---

## Error Response Schema

All error responses use the following structure:

```typescript
interface APIError {
  statusCode: number;               // HTTP status code
  message: string;                  // Error message from server
  details?: any;                    // Optional additional details
}
```

**Example**:
```json
{
  "statusCode": 400,
  "message": "Email is required"
}
```

---

## HTTP Status Codes

### 400 Bad Request

**Meaning**: Client provided invalid or incomplete data.

**Common Scenarios**:
- Missing required fields (date, time, etc.)
- Invalid data format (malformed email, invalid pattern)
- Validation constraint violation

**Examples**:
```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```
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
  "message": "Invalid date format. Please use yyyy-MM-dd"
}
```

**Frontend Action** (FR-022):
- Display the error message in a form field or inline
- Highlight the problematic field if possible
- Allow user to correct and retry
- Example: Show error below date input field

**Retry Strategy**: User corrects input and resubmits

---

### 401 Unauthorized

**Meaning**: Authentication failed or session expired.

**Common Scenarios**:
- Invalid credentials (wrong email/password)
- Missing Authorization header
- Access token expired
- Refresh token expired or revoked
- Rate limit exceeded on login attempts

**Examples**:
```json
{
  "statusCode": 401,
  "message": "Invalid email or password. Please try again."
}
```
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Valid access token required"
}
```
```json
{
  "statusCode": 401,
  "message": "Refresh token is invalid or expired. Please log in again."
}
```
```json
{
  "statusCode": 401,
  "message": "Too many login attempts. Please try again later."
}
```

**Frontend Action** (FR-021):
- **On login page**: Display error message, allow retry with different credentials
- **On authenticated page during API call**: 
  1. Attempt automatic token refresh using refresh token
  2. If refresh succeeds, retry the original request with new access token
  3. If refresh fails, clear all tokens and redirect to login page
  4. Display message: "Your session has expired. Please log in again."

**Retry Strategy**:
- Automatic 401 retry via token refresh (transparent to user) for SC-005 compliance
- Manual retry after login for expired/revoked refresh token

---

### 409 Conflict

**Meaning**: The request conflicts with existing data or business rules.

**Common Scenarios**:
- Username already exists
- Email already registered
- Record could not be created (duplicate, constraint violation)

**Examples**:
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
```json
{
  "statusCode": 409,
  "message": "Conflict - Record could not be created"
}
```

**Frontend Action** (FR-022):
- Display the error message in the form
- Suggest alternative action (e.g., "Try a different username" or "Log in instead?")
- Allow user to modify and retry

**Retry Strategy**: User adjusts data and resubmits

---

### 500 Internal Server Error

**Meaning**: Server encountered an unexpected error.

**Common Scenarios**:
- Database connection failure
- Unhandled exception in API
- Third-party service failure (email sending, etc.)

**Examples**:
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred. Please try again later."
}
```

**Frontend Action** (FR-022):
- Display generic user-friendly message (not the technical error)
- Offer option to retry
- Suggest contacting support if error persists
- Log the error for debugging

**Example Message to User**: "Something went wrong. Please try again later. If the problem persists, contact our support team."

**Retry Strategy**: User can retry after waiting a moment

---

## Error Message Mapping

### Frontend Error Handler

The frontend implements a centralized error handler to provide consistent, user-friendly messages:

```javascript
function handleAPIError(response, defaultMessage = "An error occurred") {
  const error = await response.json();
  
  switch(error.statusCode) {
    case 400:
      return {
        type: 'validation',
        message: error.message,              // Use server message for specificity
        userMessage: error.message
      };
    
    case 401:
      if (isLoginPage()) {
        return {
          type: 'authentication',
          message: error.message,
          userMessage: error.message || "Invalid email or password"
        };
      } else {
        return {
          type: 'session_expired',
          message: 'Session expired',
          userMessage: "Your session has expired. Please log in again.",
          action: 'redirect_to_login'
        };
      }
    
    case 409:
      return {
        type: 'conflict',
        message: error.message,
        userMessage: error.message
      };
    
    case 500:
      return {
        type: 'server_error',
        message: error.message,
        userMessage: "Something went wrong. Please try again later.",
        action: 'show_retry_button'
      };
    
    default:
      return {
        type: 'unknown',
        message: error.message,
        userMessage: defaultMessage
      };
  }
}
```

### Display Strategy

| Error Type | Display Location | Style | Dismissible |
|-----------|-----------------|-------|------------|
| validation (400) | Inline, below field | Red text or border | Yes, auto-clear on change |
| authentication (401, login page) | Form-level message | Red text, centered | Yes, form retry |
| session_expired (401, other pages) | Modal or toast | Red toast, prominent | No, action required (login) |
| conflict (409) | Inline, below field | Orange/yellow text | Yes, form retry |
| server_error (500) | Toast notification | Orange toast | Yes, with retry button |

---

## Validation Error Examples

### Email Validation

```json
{
  "statusCode": 400,
  "message": "Please enter a valid email address"
}
```

**Frontend Display**: Below email input field in red

### Password Requirements

```json
{
  "statusCode": 400,
  "message": "Password must be at least 8 characters"
}
```

**Frontend Display**: Below password input field with suggestion

### Username Pattern

```json
{
  "statusCode": 400,
  "message": "Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores"
}
```

**Frontend Display**: Below username input field with pattern explanation

### Required Fields

```json
{
  "statusCode": 400,
  "message": "Date and Time are required"
}
```

**Frontend Display**: Highlight both date and time fields as required

---

## Recommended Error Messages

### For Users (Display)

| Scenario | Message |
|----------|---------|
| Generic validation error | "Please check your input and try again" |
| Email validation | "Please enter a valid email address" |
| Password too short | "Password must be at least 8 characters" |
| Username taken | "This username is already taken. Try a different one." |
| Email registered | "This email is already registered. Would you like to log in instead?" |
| Invalid credentials | "Email or password is incorrect. Please try again." |
| Session expired | "Your session has expired. Please log in again." |
| Server error | "Something went wrong. Please try again later." |
| Network error | "Connection error. Please check your internet and try again." |
| Rate limited | "Too many attempts. Please wait a few minutes and try again." |

### For Developers (Logging)

Log the full error response for debugging:
```javascript
console.error('API Error:', {
  status: response.status,
  statusCode: error.statusCode,
  message: error.message,
  details: error.details,
  url: response.url,
  timestamp: new Date().toISOString()
});
```

---

## Network Error Handling

### Request Timeout

**Scenario**: No response after X seconds

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

try {
  const response = await fetch(url, { signal: controller.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    displayError("Request timed out. Please check your connection and try again.");
  }
}
```

### Network Unreachable

**Scenario**: No internet connection

```javascript
try {
  const response = await fetch(url);
} catch (error) {
  displayError("Connection error. Please check your internet and try again.");
}
```

### CORS Error

**Scenario**: API is not accessible (usually indicates misconfigured backend)

```javascript
// Browser will block request and show error in console
// Display generic message to user
displayError("Service temporarily unavailable. Please try again later.");
```

---

## Error Recovery Strategies

### Retry Logic

```javascript
async function fetchWithRetry(url, options, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 500) {
        if (attempt < maxRetries) {
          await delay(1000 * attempt); // Exponential backoff
          continue;
        }
      }
      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        await delay(1000 * attempt);
        continue;
      }
      throw error;
    }
  }
}
```

### Token Refresh on 401

```javascript
async function handleUnauthorized() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    redirectToLogin();
    return false;
  }
  
  try {
    const response = await fetch('/api/auth/token/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      return true;
    } else {
      redirectToLogin();
      return false;
    }
  } catch (error) {
    redirectToLogin();
    return false;
  }
}
```

---

## Summary

**All error responses are JSON with `statusCode` and `message` fields**.

| Code | Type | Action |
|------|------|--------|
| 400 | Validation | Display field error, allow retry |
| 401 | Auth | Refresh token or redirect to login |
| 409 | Conflict | Display error, suggest alternative, allow retry |
| 500 | Server | Show generic message, offer retry |

**Consistency** (FR-009): All errors use standardized response format and are handled by centralized error handler in the frontend.

